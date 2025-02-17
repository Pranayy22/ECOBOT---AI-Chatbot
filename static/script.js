let currentChatId = "1";
let isSpeaking = false;
let synth = window.speechSynthesis;

document.getElementById("dark-mode-toggle").addEventListener("click", function() {
    document.body.classList.toggle("light-mode");
    this.textContent = document.body.classList.contains("light-mode") ? "🌞 Light Mode" : "🌙 Dark Mode";
});

// 🎙️ Mic Button Click Event
document.getElementById("mic-toggle").addEventListener("click", function() {
    if (isSpeaking) {
        synth.cancel();  // 🔇 Stop Speaking
        isSpeaking = false;
    } else {
        let lastBotMessage = document.querySelector(".message.bot:last-child");
        if (lastBotMessage) {
            speak(lastBotMessage.textContent);
        }
    }
});

// 🔊 Speak Function (Only on Mic Button Click)
function speak(text) {
    if (!text) return;

    let speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.onend = () => { isSpeaking = false; };  // 🎤 Reset After Speaking

    isSpeaking = true;
    synth.speak(speech);
}

// 🎯 **Now, Pressing Enter Will Also Send Message**
document.getElementById("user-input").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent Default Form Submission
        sendMessage(); // ⏩ Call sendMessage() on Enter Key
    }
});

// 🔹 Send Message Function (Fixed)
function sendMessage() {
    let userInput = document.getElementById("user-input").value.trim();
    if (userInput === "") return;

    let chatBox = document.getElementById("chat-box");

    // 👤 User Message
    let userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.textContent = userInput;
    chatBox.appendChild(userMessage);

    // 🤖 Bot Typing...
    let botMessage = document.createElement("div");
    botMessage.className = "message bot";
    botMessage.textContent = "Typing...";
    chatBox.appendChild(botMessage);

    // 🔄 Fetch API to Send Message
    fetch("/chat", {
        method: "POST",
        body: JSON.stringify({ message: userInput, chat_id: currentChatId }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        botMessage.textContent = data.response;  // ✅ Bot Answer

        // 🔊 Speak (Only if Mic Button is Clicked)
        if (isSpeaking) {
            speak(data.response);
        }
    });

    document.getElementById("user-input").value = "";  // Clear Input Field
}

// 🎤 Voice Input (Speech-to-Text)
document.getElementById("mic-btn").addEventListener("click", function() {
    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = function(event) {
        let transcript = event.results[0][0].transcript;
        document.getElementById("user-input").value = transcript;
        sendMessage(); // 🎤 Automatically Send Message After Speech
    };
});

// 🆕 Start New Chat
function newChat() {
    fetch("/new_chat", { method: "POST" })
        .then(response => response.json())
        .then(data => {
            currentChatId = data.chat_id;
            document.getElementById("chat-box").innerHTML = "";
            updateChatHistory();
        });
}

// 📜 Load Chat History
function loadChat(chatId) {
    currentChatId = chatId;
    fetch("/get_chat", {
        method: "POST",
        body: JSON.stringify({ chat_id: chatId }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        let chatBox = document.getElementById("chat-box");
        chatBox.innerHTML = "";
        data.messages.forEach(msg => {
            let userMessage = document.createElement("div");
            userMessage.className = "message user";
            userMessage.textContent = msg.user;
            chatBox.appendChild(userMessage);

            let botMessage = document.createElement("div");
            botMessage.className = "message bot";
            botMessage.textContent = msg.bot;
            chatBox.appendChild(botMessage);
        });
    });
}

// 🗑️ Delete Chat
function deleteChat(chatId) {
    fetch("/delete_chat", {
        method: "POST",
        body: JSON.stringify({ chat_id: chatId }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(() => {
        updateChatHistory();
    });
}

// 🔄 Update Chat History
function updateChatHistory() {
    fetch("/")
        .then(response => response.text())
        .then(html => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, "text/html");
            document.getElementById("chat-history").innerHTML = doc.getElementById("chat-history").innerHTML;
        });
}



function sendMessage() {
    let userInput = document.getElementById("user-input").value.trim();
    if (userInput === "") return;

    let chatBox = document.getElementById("chat-box");

    // 👤 User Message
    let userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.textContent = userInput;
    chatBox.appendChild(userMessage);

    // 🤖 Bot Typing...
    let botMessageContainer = document.createElement("div");
    botMessageContainer.className = "bot-container";

    let botMessage = document.createElement("div");
    botMessage.className = "message bot";
    botMessage.textContent = "Thinking..."; // Initially, bot is thinking

    let copyButton = document.createElement("button");
    copyButton.className = "copy-btn";
    copyButton.textContent = "📋 Copy";
    copyButton.style.display = "none"; // Hide Copy button initially
    copyButton.onclick = function () {
        navigator.clipboard.writeText(botMessage.textContent);
        copyButton.textContent = "✅ Copied!";
        setTimeout(() => (copyButton.textContent = "📋 Copy"), 2000);
    };

    botMessageContainer.appendChild(botMessage);
    botMessageContainer.appendChild(copyButton);
    chatBox.appendChild(botMessageContainer);

    // 🔄 Fetch API to Get Response
    fetch("/chat", {
        method: "POST",
        body: JSON.stringify({ message: userInput, chat_id: currentChatId }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        botMessage.textContent = data.response;  // ✅ Update Bot Answer
        copyButton.style.display = "inline-block"; // ✅ Show Copy button when answer is fully loaded
    });

    document.getElementById("user-input").value = "";  // Clear Input Field
}


function openSettings() {
    document.getElementById('settings-modal').style.display = 'block';
}

function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
}



// ⚙️ Open Settings
function openSettings() {
    window.location.href = "settings.html";
}