// Firebase config (replace with your Firebase project info)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Elements
const loginContainer = document.getElementById('login-container');
const groupContainer = document.getElementById('group-container');
const chatContainer = document.getElementById('chat-container');

const usernameInput = document.getElementById('usernameInput');
const enterBtn = document.getElementById('enterBtn');

const displayUsername = document.getElementById('displayUsername');
const groupInput = document.getElementById('groupInput');
const createGroupBtn = document.getElementById('createGroupBtn');
const joinGroupBtn = document.getElementById('joinGroupBtn');

const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const backBtn = document.getElementById('backBtn');

let username = '';
let currentGroup = '';

// Step 1: Enter Username
enterBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if(name !== '') {
    username = name;
    displayUsername.textContent = username;
    loginContainer.style.display = 'none';
    groupContainer.style.display = 'block';
  }
});

// Step 2: Create Group
createGroupBtn.addEventListener('click', () => {
  const groupName = groupInput.value.trim();
  if(groupName !== '') {
    currentGroup = groupName;
    startChat();
  }
});

// Step 3: Join Group
joinGroupBtn.addEventListener('click', () => {
  const groupName = groupInput.value.trim();
  if(groupName !== '') {
    currentGroup = groupName;
    startChat();
  }
});

// Step 4: Start Chat
function startChat() {
  groupContainer.style.display = 'none';
  chatContainer.style.display = 'block';
  document.getElementById('currentGroup').textContent = currentGroup;

  // Listen for messages
  db.ref('groups/' + currentGroup + '/messages').on('child_added', snapshot => {
    const msg = snapshot.val();
    const msgDiv = document.createElement('div');
    msgDiv.textContent = msg.username + ': ' + msg.text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Send Message
sendBtn.addEventListener('click', () => {
  const text = messageInput.value.trim();
  if(text !== '') {
    const newMsg = db.ref('groups/' + currentGroup + '/messages').push();
    newMsg.set({
      username: username,
      text: text,
      timestamp: Date.now()
    });
    messageInput.value = '';
  }
});

// Back to groups
backBtn.addEventListener('click', () => {
  chatContainer.style.display = 'none';
  groupContainer.style.display = 'block';
  chatBox.innerHTML = '';
  db.ref('groups/' + currentGroup + '/messages').off();
});
