// Expandable Bible verse database
const DATABASE = {
    "does jesus love everybody": {
        ref: "John 3:16",
        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        christian: "This is the most famous verse in the Bible. It shows that God's love is available to all who believe in Jesus.",
        hebrew: "The 'world' in this verse refers to the scattered children of Israel. God's love is directed toward His chosen people.",
        jewish: "While we don't accept Jesus as divine, this verse reflects the idea that God loves humanity and desires relationship with us."
    },
    "what is salvation": {
        ref: "Romans 10:9",
        text: "That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved.",
        christian: "Salvation comes through faith in Jesus Christ as your personal savior. It's a gift from God available to all who believe.",
        hebrew: "Salvation refers to deliverance from bondage and oppression. For Hebrew Israelites, it means liberation and restoration of our people.",
        jewish: "Salvation in Jewish tradition means healing the world (tikkun olam) through righteous deeds and studying Torah."
    },
    "what does god want from me": {
        ref: "Micah 6:8",
        text: "He hath shewed thee, O man, what is good; and what doth the Lord require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?",
        christian: "God wants us to live righteously, show compassion, and maintain a humble relationship with Him through faith in Jesus.",
        hebrew: "God requires justice for our people, mercy toward our brethren, and humble submission to the Most High's will.",
        jewish: "God asks us to act justly, love kindness, and walk humbly. These are the foundations of ethical living in Judaism."
    }
};

// Search function triggered by button or Enter key
function searchQuestion() {
    const input = document.getElementById("questionInput").value.trim();
    const resultDiv = document.getElementById("result");
    
    if (!input) return;
    
    const key = input.toLowerCase();
    const entry = DATABASE[key];

    resultDiv.innerHTML = `<h2 style="margin:20px 0 16px; font-size:24px;">${input}</h2>`;

    if (entry) {
        resultDiv.innerHTML += `
            <div class="verse-card">
                <div class="reference">${entry.ref}</div>
                <div class="verse-text">"${entry.text}"</div>
                
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
        resultDiv.innerHTML += `<p style="text-align:center;opacity:0.7;padding:30px;">No answer available for this question yet. Try one of the sample questions or add your own!</p>`;
    }
}

// Allow Enter key to trigger search
document.addEventListener("DOMContentLoaded", function() {
    const input = document.getElementById("questionInput");
    if (input) {
        input.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                searchQuestion();
            }
        });
    }
});