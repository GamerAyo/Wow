// --- Firebase Config (replace with your own Firebase project) ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- DOM Elements ---
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typing-indicator');
const usersList = document.getElementById('users-list');
const roomsList = document.getElementById('rooms-list');
const newRoomInput = document.getElementById('new-room');
const createRoomBtn = document.getElementById('create-room');
const emojiBtn = document.getElementById('emojiBtn');
const imageBtn = document.getElementById('imageBtn');
const imageInput = document.getElementById('imageInput');
const themeBtn = document.getElementById('themeBtn');

let username = prompt("Enter your username") || "Anonymous";
let currentRoom = "general";

// --- User Presence ---
const userRef = db.ref("online-users/" + username);
userRef.set(true);
userRef.onDisconnect().remove();

// --- Rooms ---
function createRoom(name){
  db.ref("rooms/" + name).set(true);
}
createRoomBtn.addEventListener('click', () => {
  const name = newRoomInput.value.trim();
  if(name) createRoom(name);
});
db.ref("rooms").on('value', snapshot => {
  roomsList.innerHTML = '';
  snapshot.forEach(child => {
    const li = document.createElement('li');
    li.textContent = child.key;
    li.onclick = () => {
      currentRoom = child.key;
      loadMessages();
    };
    roomsList.appendChild(li);
  });
});

// --- Messages ---
function loadMessages(){
  chatBox.innerHTML = '';
  db.ref("messages/" + currentRoom).off();
  db.ref("messages/" + currentRoom).on('child_added', snapshot => {
    const msg = snapshot.val();
    const div = document.createElement('div');
    div.className = "message " + (msg.user === username ? "own" : "other");
    div.innerHTML = `<strong>${msg.user}</strong> [${new Date(msg.timestamp).toLocaleTimeString()}]: ${msg.text || ''}${msg.image ? '<br><img src="'+msg.image+'" width="100">' : ''}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}
loadMessages();

// --- Send Messages ---
sendBtn.addEventListener('click', () => {
  const text = messageInput.value.trim();
  if(!text) return;
  db.ref("messages/" + currentRoom).push({
    user: username,
    text,
    timestamp: Date.now()
  });
  messageInput.value = '';
});

// --- Typing Indicator ---
messageInput.addEventListener('input', () => {
  db.ref("typing/" + currentRoom + "/" + username).set(true);
  setTimeout(() => {
    db.ref("typing/" + currentRoom + "/" + username).remove();
  }, 1000);
});
db.ref("typing/" + currentRoom).on('value', snapshot => {
  const users = Object.keys(snapshot.val() || {}).filter(u => u !== username);
  typingIndicator.textContent = users.length ? users.join(', ') + ' is typing...' : '';
});

// --- Online Users ---
db.ref("online-users").on('value', snapshot => {
  usersList.innerHTML = '';
  snapshot.forEach(child => {
    const li = document.createElement('li');
    li.textContent = child.key;
    usersList.appendChild(li);
  });
});

// --- Image Upload ---
imageBtn.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = e => {
      db.ref("messages/" + currentRoom).push({
        user: username,
        image: e.target.result,
        timestamp: Date.now()
      });
    }
    reader.readAsDataURL(file);
  }
});

// --- Emoji Picker ---
emojiBtn.addEventListener('click', () => {
  messageInput.value += '😀';
});

// --- Theme Switch ---
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});
