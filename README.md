# Reader3 - EPUB Reader with AI Analysis

A lightweight, self-hosted EPUB reader with integrated AI analysis capabilities.

## Features

### Reading Experience
- 📚 **Clean Layout** - Three-column design (TOC, Content, AI Panel)
- 📖 **Sticky Navigation** - Top navigation bar stays visible while scrolling
- ⌨️ **Keyboard Shortcuts** - Arrow keys for prev/next chapter, ESC to close panels
- 🔗 **Internal Links** - Footnotes and author comments open in modal popups
- 🎯 **Clickable Covers** - Click book covers to start reading instantly

### AI & Annotations
- 🤖 **AI Analysis** - Right-click on text for fact-checking or discussion (DeepSeek)
- � ***Personal Comments** - Add your own notes without AI (no API cost)
- 💾 **Manual Save** - Choose what to save to avoid clutter
- ✨ **Color-Coded Highlights** - Yellow (fact check), Blue (discussion), Green (comments)
- 🏷️ **Smart Tooltips** - Hover over highlights to see type
- 🗑️ **Edit & Delete** - Manage all your highlights and comments
- 🎨 **Markdown Support** - AI responses render with proper formatting

### Library & Organization
- 📝 **Highlights View** - See all your notes and analyses for each book
- 📤 **Export to Markdown** - Export highlights with AI context warnings
- 🌐 **Web Upload** - Upload EPUB files via click or drag & drop
- 🖼️ **Cover Images** - Automatic cover extraction and display
- 🔍 **Search** - Find books by title or author
- 🗂️ **Organized Storage** - All books in `books/` directory, data in SQLite

## Quick Start

### 1. Configure API Key

Edit `.env` file:
```bash
OPENAI_API_KEY=your_deepseek_key
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_MODEL=deepseek-chat
```

Get your key from: https://platform.deepseek.com/api_keys

### 2. Add Books

**Option A: Upload via Web Interface (Recommended)**
1. Start server: `uv run server.py`
2. Open http://127.0.0.1:8123
3. Click the "+" card OR drag & drop EPUB file
4. Wait for automatic processing

**Option B: Command Line**
```bash
uv run reader3.py your_book.epub
```

### 3. Start Server

```bash
uv run server.py
```

### 4. Read and Analyze

1. Open http://127.0.0.1:8123
2. Select a book
3. Right-click on text → Choose analysis type
4. Review AI response in side panel
5. Save if important
6. Highlights appear on next visit!

## Usage

### AI Analysis
- Select text → Right-click → Choose:
  - **📋 Fact Check** - Verify facts and get context
  - **💡 Discussion** - Deep analysis and insights
  - **💬 Add Comment** - Your personal notes (no AI)
- View response in right panel
- Click "Save" for important insights

### Highlights
- **Yellow** - Fact checks
- **Blue** - Discussions
- **Green** - Your comments
- Hover to see type, click to view/edit
- All highlights are editable and deletable

### View & Export Highlights
- Click ⋮ menu on any book → "View Highlights"
- See all your notes and analyses in one page
- Filter by type (Fact Check, Discussion, Comment)
- Export to markdown for AI processing
- Context length warnings for large exports
- Jump directly to any chapter

### Keyboard Shortcuts
- **← →** - Navigate between chapters
- **ESC** - Close panels and modals
- Works anywhere except when typing in text fields

## Project Structure

```
reader3/
├── reader3.py          # EPUB processor
├── server.py           # Web server
├── database.py         # SQLite operations
├── ai_service.py       # AI integration
├── books/              # All book data here
│   └── book_name_data/
│       ├── book.pkl
│       └── images/
├── templates/          # HTML templates
├── reader_data.db      # SQLite database
└── .env                # API configuration
```

## Data Management

### View Your Highlights
- Click ⋮ menu on any book → "View Highlights"
- See all notes, comments, and analyses in one page
- Filter by type and jump to chapters

### View Database (Advanced)
```bash
uv run check_database.py
```

### Backup
```bash
# Double-click: backup.bat
# Or manually:
copy reader_data.db backups\reader_data_backup.db
```

## Tools

- `check_database.py` - View raw database contents (advanced)
- `backup.bat` - Quick database backup

## Why DeepSeek?

- ✅ Cost-effective (¥1/M tokens input, ¥2/M output)
- ✅ Excellent Chinese language support
- ✅ Fast response in China
- ✅ OpenAI-compatible API

## Troubleshooting

### API Key Error
1. Check `.env` file exists and has correct key
2. Restart server

### No Highlights Showing
1. Check browser console (F12) for errors
2. Verify data exists: `uv run check_database.py`
3. Hard refresh (Ctrl+Shift+R)

### Server Won't Start
1. Check if port 8123 is available
2. Verify `.env` configuration

## License

MIT

---

**Note**: This project is designed to be simple and hackable. Ask your LLM to modify it however you like!
