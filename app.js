var stompClient = null;
var username = null;

function enterChatRoom() {
    username = document.getElementById("username").value.trim();
    if (username) {
        document.getElementById("welcome-form").style.display = "none";
        document.getElementById("chat-container").style.display = "flex";
        connect();
    } else {
        alert("Por favor, insira um username.");
    }
}

function connect() {
    var socket = new SockJS("https://25a9eb0b9e99.ngrok-free.app/chat-websocket", {
        headers: { "ngrok-skip-browser-warning": "true" }
    });

    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log("Conectado: " + frame);

        stompClient.subscribe("/topic/public", function (messageOutput) {
            var message = JSON.parse(messageOutput.body);
            showMessage(message);
        });

        stompClient.send("/app/addUser", {}, JSON.stringify({ sender: username, type: "JOIN" }));
    });
}

function sendMessage() {
    var messageContent = document.getElementById("messageInput").value.trim();
    if (messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageContent,
            type: "CHAT" };
        stompClient.send("/app/sendMessage", {}, JSON.stringify(chatMessage));
        document.getElementById("message").value = "";
    }
}

function showMessage(message) {
    var messageElement = document.createElement("div");
    messageElement.classList.add("message");

    if (message.type === "JOIN") {
        messageElement.classList.add("system");
        messageElement.textContent = message.sender + " entrou no chat!";
    } else if (message.type === "LEAVE") {
        messageElement.classList.add("system");
        messageElement.textContent = message.sender + " saiu do chat!";
    } else {
        if (message.sender === username) {
            messageElement.classList.add("self");
        } else {
            messageElement.classList.add("other");
        }
        messageElement.textContent = message.sender + ": " + message.content;
    }

    var chatMessages = document.getElementById("chat-messages");
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Atalho Enter para enviar mensagem
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("message").addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
});
