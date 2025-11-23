document.addEventListener('DOMContentLoaded', () => {
  const apiBaseInput = document.getElementById('apiBase');
  const apiKeyInput = document.getElementById('apiKey');
  const modelInput = document.getElementById('model');
  const saveBtn = document.getElementById('save');
  const clearBtn = document.getElementById('clear');

  // Load saved settings
  chrome.storage.local.get({ apiBase: '', apiKey: '', model: '' }, (items) => {
    apiBaseInput.value = items.apiBase || '';
    apiKeyInput.value = items.apiKey || '';
    modelInput.value = items.model || '';
  });

  saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const apiBase = apiBaseInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const model = modelInput.value.trim();
    chrome.storage.local.set({ apiBase, apiKey, model }, () => {
      saveBtn.textContent = 'Saved';
      setTimeout(() => (saveBtn.textContent = 'Save'), 1200);
    });
  });

  clearBtn.addEventListener('click', () => {
    apiBaseInput.value = '';
    apiKeyInput.value = '';
    modelInput.value = '';
    chrome.storage.local.remove(['apiBase', 'apiKey', 'model'], () => {
      clearBtn.textContent = 'Cleared';
      setTimeout(() => (clearBtn.textContent = 'Clear'), 1200);
    });
  });
});
