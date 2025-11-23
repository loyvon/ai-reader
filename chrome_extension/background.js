// Background service worker: create context menu items and call OpenAI-compatible API directly
// Default API base — used if user doesn't set one in options
const DEFAULT_API_BASE = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';

function getApiConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ apiKey: '', apiBase: DEFAULT_API_BASE, model: DEFAULT_MODEL }, (items) => {
      resolve({ apiKey: items.apiKey || '', apiBase: items.apiBase || DEFAULT_API_BASE, model: items.model || DEFAULT_MODEL });
    });
  });
}

function createContextMenus() {
  try {
    chrome.contextMenus.removeAll(() => {
      // ignore errors
      chrome.contextMenus.create({
        id: 'fact_check',
        title: 'Fact-check',
        contexts: ['selection']
      });

      chrome.contextMenus.create({
        id: 'discuss',
        title: 'Discuss',
        contexts: ['selection']
      });
    });
  } catch (e) {
    console.error('Failed to create context menus', e);
  }
}

// Ensure menus are created when the service worker starts
createContextMenus();

chrome.runtime.onInstalled.addListener(() => createContextMenus());
chrome.runtime.onStartup && chrome.runtime.onStartup.addListener(() => createContextMenus());

async function ensureContentScriptInjected(tabId) {
  return new Promise((resolve, reject) => {
    // Try sending a ping message to see if content script is present
    chrome.tabs.sendMessage(tabId, { type: 'ping' }, (resp) => {
      const err = chrome.runtime.lastError;
      if (!err && resp && resp.pong) return resolve(true);

      // Not present — inject content script and css
      chrome.scripting.executeScript(
        { target: { tabId }, files: ['content_script.js'] },
        () => {
          const cssErr = chrome.runtime.lastError;
          // inject CSS too (best-effort)
          chrome.scripting.insertCSS({ target: { tabId }, files: ['style.css'] }, () => {
            // ignore errors
            const err2 = chrome.runtime.lastError;
            if (cssErr || err2) {
              console.warn('Injected content script but got css/script error', cssErr || err2);
            }
            resolve(true);
          });
        }
      );
    });
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText || !tab || !tab.id) return;

  const selected = info.selectionText.trim();
  const analysisType = info.menuItemId === 'fact_check' ? 'fact_check' : 'discussion';

  try {
    // Ensure content script exists in the tab so messages are received
    await ensureContentScriptInjected(tab.id);

    // Tell the content script to show a loading panel
    chrome.tabs.sendMessage(tab.id, {
      type: 'show_loading',
      analysisType,
      selected
    }, (resp) => {
      if (chrome.runtime.lastError) {
        console.warn('show_loading sendMessage error:', chrome.runtime.lastError.message);
      }
    });

    // Notify content script that request is starting (helps debugging)
    chrome.tabs.sendMessage(tab.id, { type: 'request_started', analysisType, selected }, () => {});

    // Load API config
    const { apiKey, apiBase, model } = await getApiConfig();
    if (!apiKey) throw new Error('API key not configured. Open extension options and set your API Key.');

    // Build prompt according to analysis type
    let prompt = '';
    if (analysisType === 'fact_check') {
      prompt = `请帮我理解以下内容：\n\n${selected}\n\n请根据内容类型提供相应的解释：\n\n**如果是专有名词/概念**：给出清晰的定义和解释\n**如果是人物**：介绍其身份、背景和重要性\n**如果是历史事件**：说明事件经过、时间、影响\n**如果是地点**：介绍其地理位置、特点、相关背景\n**如果是数据/事实陈述**：验证准确性，提供来源或背景\n\n要求：\n- 简洁明了，重点突出\n- 如有错误或争议，明确指出\n- 如果内容不完整或无法判断，说明需要更多上下文`;
    } else {
      prompt = `请对以下文本进行深入的学术性分析和讨论：\n\n${selected}\n\n请从以下几个维度展开分析：\n\n**1. 核心论点解析**\n- 作者的主要观点是什么？\n- 论证逻辑和结构如何？\n- 使用了哪些论证方法（举例、类比、引用等）？\n\n**2. 理论与学术视角**\n- 这段文本涉及哪些学术领域或理论框架？\n- 与哪些经典理论、学派或学者的观点相关？\n- 在学术史或思想史上的位置如何？\n\n**3. 批判性思考**\n- 论证是否充分？有无逻辑漏洞？\n- 是否存在隐含的假设或前提？\n- 可能的反驳观点是什么？\n\n**4. 启发性问题**\n- 这段文本引发了哪些值得深入思考的问题？\n- 如何将这些观点应用到其他领域或情境？\n- 对当代有什么启示意义？\n\n要求：\n- 保持学术严谨性，但避免过于晦涩\n- 提出具有启发性的问题，引导深入思考\n- 如涉及专业术语，简要解释\n- 鼓励多角度、批判性的思考`;
    }

    const endpoint = (apiBase || DEFAULT_API_BASE).replace(/\/$/, '') + '/chat/completions';
    console.log('AI Reader: calling API', endpoint);

    const payload = {
      model: model || DEFAULT_MODEL,
      messages: [ { role: 'user', content: prompt } ],
      temperature: 0.7
    };

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`API error: ${resp.status} ${txt}`);
    }

    const data = await resp.json();
    // Extract assistant content (OpenAI chat completion shape)
    let assistantText = '';
    try {
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        assistantText = data.choices[0].message.content || '';
      } else if (data.choices && data.choices.length > 0 && data.choices[0].text) {
        assistantText = data.choices[0].text || '';
      } else if (data.output && typeof data.output === 'string') {
        assistantText = data.output;
      } else {
        assistantText = JSON.stringify(data);
      }
    } catch (e) {
      assistantText = JSON.stringify(data);
    }

    // Notify content script that request finished
    chrome.tabs.sendMessage(tab.id, { type: 'request_finished', status: resp.status }, () => {});

    chrome.tabs.sendMessage(tab.id, {
      type: 'show_response',
      analysisType,
      selected,
      response: assistantText
    }, (r) => {
      if (chrome.runtime.lastError) {
        console.warn('show_response sendMessage error:', chrome.runtime.lastError.message);
      }
    });

  } catch (err) {
    console.error('AI analyze error', err);
    chrome.tabs.sendMessage(tab.id, {
      type: 'show_error',
      message: err.message || String(err)
    }, (r) => {
      if (chrome.runtime.lastError) {
        // If we can't message the tab at all, show a notification as fallback
        console.warn('Failed to send error to content script:', chrome.runtime.lastError.message);
        try {
          chrome.notifications && chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'AI Reader',
            message: err.message || String(err)
          });
        } catch (e) {}
      }
    });
  }
});
