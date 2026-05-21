# Bible-clash-<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bible Clash</title>
<style>
    :root {
        --bg: #0f172a;
        --card: #1e2937;
        --gold: #f59e0b;
        --text: #f1f5f9;
    }
    
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
        background: var(--bg);
        color: var(--text);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 20px;
        line-height: 1.6;
        min-height: 100vh;
    }
    header {
        text-align: center;
        margin-bottom: 30px;
    }
    h1 {
        font-size: 42px;
        margin-bottom: 6px;
    }
    .subtitle {
        color: #94a3b8;
        font-size: 18px;
    }
    input {
        width: 100%;
        padding: 18px;
        font-size: 18px;
        background: #334155;
        border: none;
        border-radius: 16px;
        color: white;
        margin-bottom: 12px;
    }
    button {
        width: 100%;
        padding: 18px;
        font-size: 18px;
        font-weight: 700;
        background: var(--gold);
        color: #1e2937;
        border: none;
        border-radius: 16px;
        margin-bottom: 30px;
    }
    .verse-card {
        background: var(--card);
        border-radius: 20px;
        padding: 24px;
        margin-bottom: 24px;
    }
    .reference {
        color: var(--gold);
        font-weight: 700;
        font-size: 18px;
        margin-bottom: 12px;
    }
    .verse-text {
        font-size: 20px;
        font-style: italic;
        line-height: 1.7;
        margin-bottom: 24px;
        color: #e2e8f0;
    }
    .perspective {
        margin-top: 18px;
        padding-top: 18px;
        border-top: 1px solid rgba(255,255,255,0.1);
    }
    .perspective h3 {
        margin-bottom: 10px;
        font-size: 17px;
    }
    .christian h3 { color: #67e8f9; }
    .hebrew h3 { color: #c4b5fd; }
    .jewish h3 { color: #fcd34d; }
</style>
</head>
<body>

<header>
    <h1>⚔️ Bible Clash</h1>
    <p class="subtitle">KJV • Three Perspectives</p>
</header>

<input type="text" id="questionInput" placeholder="Ask a question about the Bible…">
<button onclick="searchQuestion()">Ask</button>

<div id="result"></div>

<script>
// Add more questions here in the future
const DATABASE = {
    "does jesus love everybody": {
        ref: "John 3:16",
        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        christian: "This is the most famous verse in the Bible. It shows that God's love is available to all who believe in Jesus.",
        hebrew: "The 'world' in this verse refers to the scattered children of Israel. God's love is directed toward His chosen people.",
        jewish: "While we don't accept Jesus as divine, this verse reflects the idea that God loves humanity and desires relationship with us."
    }
};

function searchQuestion() {
    const input = document.getElementById("questionInput").value.trim();
    const resultDiv = document.getElementById("result");
    
    if (!input) return;
    
    const key = input.toLowerCase();
    const entry = DATABASE;

    resultDiv.innerHTML = `<h2 style="margin:20px 0 16px; font-size:24px;">${input}</h2>`;

    if (entry) {
        resultDiv.innerHTML += `
            <div class="verse-card">
                <div class="reference">${entry.ref}</div>
                <div class="verse-text">“${entry.text}”</div>
                
                <div class="perspective christian">
                    <h3>✝ Christian Perspective</h3>
                    <p>${entry.christian}</p>
                </div>
                
                <div class="perspective hebrew">
                    <h3>✡ Black Hebrew Israelite Perspective</h3>
                    <p>${entry.hebrew}</p>
                </div>
                
                <div class="perspective jewish">
                    <h3>🕎 Jewish Perspective</h3>
                    <p>${entry.jewish}</p>
                </div>
            </div>`;
    } else {
        resultDiv.innerHTML += `<p style="text-align:center;opacity:0.7;padding:30px;">No answer available for this question yet.</p>`;
    }
}
</script>

</body>
</html>
