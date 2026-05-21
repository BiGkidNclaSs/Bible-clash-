// Bible Clash Application
// Database of Bible questions and their three perspectives

const DATABASE = {
    "does jesus love everybody": {
        ref: "John 3:16",
        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        christian: "This is the most famous verse in the Bible. It shows that God's love is available to all who believe in Jesus. His sacrifice demonstrates unconditional love for humanity.",
        hebrew: "The 'world' in this verse refers to the scattered children of Israel. God's love is directed toward His chosen people and their restoration.",
        jewish: "While we don't accept Jesus as divine, this verse reflects the Jewish understanding that God loves humanity and desires a covenant relationship with us."
    },
    "what is salvation": {
        ref: "Romans 10:9",
        text: "That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved.",
        christian: "Salvation is the gift of eternal life through faith in Jesus Christ. It comes through believing in His death and resurrection, which paid the price for our sins.",
        hebrew: "Salvation refers to the deliverance and restoration of the children of Israel to their rightful place. It's about redemption from physical and spiritual captivity.",
        jewish: "Salvation in Jewish tradition means redemption through following Torah and living righteously. It's about personal transformation and the world to come, not dependent on a single savior."
    },
    "what does god want from me": {
        ref: "Micah 6:8",
        text: "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?",
        christian: "God wants us to live righteously, show compassion, and maintain a humble relationship with Him through faith in Christ. It's about both belief and good works reflecting His character.",
        hebrew: "God requires justice, mercy, and humility from His people. This reflects the divine law and the proper conduct expected of those chosen to carry out God's will.",
        jewish: "The Torah teaches that God wants us to pursue justice, show kindness, and approach the divine with humility. This is the essence of living a righteous Jewish life."
    }
};

// Add event listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('questionInput');
    if (input) {
        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchQuestion();
            }
        });
    }
});

// Main search function
function searchQuestion() {
    const input = document.getElementById("questionInput").value.trim();
    const resultDiv = document.getElementById("result");
    
    if (!input) {
        resultDiv.innerHTML = '';
        return;
    }
    
    const key = input.toLowerCase();
    const entry = DATABASE[key];

    resultDiv.innerHTML = `<h2 style="margin:20px 0 16px; font-size:24px;">${input}</h2>`;

    if (entry) {
        resultDiv.innerHTML += `
            <div class="verse-card">
                <div class="reference">${entry.ref}</div>
                <div class="verse-text">"${entry.text}"</div>
                
                <div class="perspective christian">
                    <h3>✝️ Christian Perspective</h3>
                    <p>${entry.christian}</p>
                </div>
                
                <div class="perspective hebrew">
                    <h3>✡️ Black Hebrew Israelite Perspective</h3>
                    <p>${entry.hebrew}</p>
                </div>
                
                <div class="perspective jewish">
                    <h3>🕎 Jewish Perspective</h3>
                    <p>${entry.jewish}</p>
                </div>
            </div>`;
    } else {
        resultDiv.innerHTML += `<p style="text-align:center;opacity:0.7;padding:30px;">No answer available for this question yet. Try one of the available questions or contribute by adding more!</p>`;
    }
}
