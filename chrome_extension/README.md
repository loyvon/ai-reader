# AI Reader Chrome Extension

This extension adds two context-menu commands to the browser when you select text: `Fact-check` and `Discuss`.

What it does:
- Sends the selected text to an OpenAI-compatible API from the extension background.
- Displays the AI response in a right-side chatbot panel on the current page.

Installation (developer / unpacked mode):

1. In Chrome, go to `chrome://extensions/` and enable "Developer mode".
2. Click "Load unpacked" and select the `chrome_extension/` directory in this repo.
3. Visit any page, select some text, right-click and choose the AI Reader command.

Notes:
- The extension can call an OpenAI-compatible API directly. Open the extension Options (chrome://extensions → Details → Extension options) and set:
	- `API Base URL` (e.g. `https://api.openai.com/v1`)
	- `API Key` (your Bearer key)
	- `Model` (optional)
	The extension will send requests with `Authorization: Bearer <API Key>` from the background service worker.
