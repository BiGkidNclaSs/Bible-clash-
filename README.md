# ⚔️ Bible Clash

A web application that presents Bible verses with three different religious perspectives: Christian, Black Hebrew Israelite, and Jewish interpretations.

## Features

- 🔍 Search for Bible questions
- ✝ Christian perspective on verses
- ✡ Black Hebrew Israelite perspective on verses  
- 🕎 Jewish perspective on verses
- 🎨 Modern, dark-themed UI with gold accents
- 📱 Fully responsive design
- ⌨️ Enter key support for searching

## Getting Started

### Option 1: Run Locally

1. Clone this repository:
```bash
git clone https://github.com/BiGkidNclaSs/Bible-clash-.git
cd Bible-clash-
```

2. Open `index.html` in your browser or serve with a local server:
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js
npx http-server
```

3. Open `http://localhost:8000` in your browser

### Option 2: Deploy to GitHub Pages

1. In your repository settings, go to "Pages"
2. Select `main` branch as source
3. Your site will be available at `https://yourusername.github.io/Bible-clash-`

### Option 3: Use Live Server (VS Code)

1. Install the "Live Server" extension
2. Right-click `index.html` and select "Open with Live Server"

### Option 4: Open It on Your Phone (QR Code)

Run `/mobile` in a Claude Code session to print a QR code you can scan with your
phone camera. `/ios` and `/android` do the same thing.

```bash
# Or run the generator directly, without Claude Code:
node .claude/scripts/qr.js              # QR for the deployed site
node .claude/scripts/qr.js --local 8000 # QR for http://<your-lan-ip>:8000/
```

Useful flags:

| Flag | Effect |
| --- | --- |
| `--local [port]` | Encode this machine's LAN address instead of the live site, so you can test local changes on a real phone. Serve the directory first (`python3 -m http.server 8000`) and keep the phone on the same network. |
| `--invert` | Swap light and dark. Try this if a dark terminal makes the code hard to scan. |
| `--big` | Draw each module as two characters. Easier to scan, but too wide for an 80-column terminal — and a wrapped QR code will not scan at all. |
| `--ecc L\|M\|Q\|H` | Error correction level (default `M`). |

Any other argument is encoded verbatim, so `node .claude/scripts/qr.js "https://example.com"`
works as a general purpose QR generator.

## How to Use

1. Type a Bible question in the input field
2. Click "Ask" or press Enter
3. View the verse and three different perspectives

## Available Questions

Try these sample questions:
- "does jesus love everybody"
- "what is salvation"
- "what does god want from me"

## File Structure

```
Bible-clash-/
├── index.html      # Main HTML structure
├── styles.css      # Styling and responsive design
├── script.js       # Application logic and database
├── README.md       # Documentation
└── .claude/
    ├── commands/   # /mobile, /ios and /android slash commands
    └── scripts/    # qr.js — dependency-free QR code generator (+ tests)
```

## Adding More Questions

Edit `script.js` and add entries to the `DATABASE` object:

```javascript
"your question here": {
    ref: "Book Chapter:Verse",
    text: "The actual verse text...",
    christian: "Christian interpretation...",
    hebrew: "Hebrew Israelite interpretation...",
    jewish: "Jewish interpretation..."
}
```

The question key will automatically be converted to lowercase for matching.

## Customization

### Colors

Edit the CSS variables in `styles.css`:
```css
:root {
    --bg: #0f172a;        /* Background color */
    --card: #1e2937;      /* Card background */
    --gold: #f59e0b;      /* Accent color */
    --text: #f1f5f9;      /* Text color */
}
```

## Technologies

- **HTML5** - Structure
- **CSS3** - Styling with custom properties and flexbox
- **Vanilla JavaScript** - No dependencies, pure JS logic

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- [ ] Connect to live Bible API (Bible.com, Crossway, etc.)
- [ ] Add search functionality by book and verse number
- [ ] Add more religious perspectives (Islamic, Buddhist, etc.)
- [ ] User favorite verses and bookmarks
- [ ] Mobile app version (React Native/Flutter)
- [ ] Multi-language support
- [ ] Dark/Light mode toggle
- [ ] Share verses to social media

## License

MIT License - Feel free to use this project for personal or educational purposes.

## Contributing

Pull requests are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-questions`)
3. Add your Bible questions to `script.js`
4. Commit your changes (`git commit -m 'Add new Bible questions'`)
5. Push to the branch (`git push origin feature/new-questions`)
6. Open a Pull Request

## Support

If you have questions or suggestions, please open an issue on GitHub.

---

**Built with ⚔️ for Biblical study and interfaith dialogue**