# ⚔️ Bible Clash

A web application that presents Bible verses with three different religious perspectives: Christian, Black Hebrew Israelite, and Jewish interpretations.

## Features

- 🔍 Search for Bible questions
- ✝ Christian perspective on verses
- ✡ Black Hebrew Israelite perspective on verses  
- 🕎 Jewish perspective on verses
- 🎨 Modern, dark-themed UI
- 📱 Fully responsive design

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

## How to Use

1. Type a Bible question in the input field
2. Click "Ask" or press Enter
3. View the verse and three perspectives

**Available questions:**
- "does jesus love everybody"
- "what is salvation"

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

## Technologies

- HTML5
- CSS3 (Custom Properties)
- Vanilla JavaScript

## Color Scheme

- Background: `#0f172a` (dark blue)
- Cards: `#1e2937` (slate)
- Accent: `#f59e0b` (gold)
- Text: `#f1f5f9` (light)

## Future Enhancements

- [ ] Connect to live Bible API (Bible.com, Crossway, etc.)
- [ ] Add search functionality by book and verse number
- [ ] Add more perspectives
- [ ] User favorite verses
- [ ] Mobile app version
- [ ] Multi-language support

## License

MIT

## Contributing

Pull requests welcome! Feel free to add more Bible questions and perspectives.
