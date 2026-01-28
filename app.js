// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push, set, onChildAdded, off } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB7drh_0Iqth7NBYJOP656TD4gQzCJ_4GQ",
  authDomain: "nice-7909b.firebaseapp.com",
  databaseURL: "https://nice-7909b-default-rtdb.firebaseio.com",
  projectId: "nice-7909b",
  storageBucket: "nice-7909b.appspot.com",
  messagingSenderId: "285281313451",
  appId: "1:285281313451:web:b347ee27d98c001cec4dee",
  measurementId: "G-4PJ7W7GNTB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// HTML Elements
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
let groupRef = null;

// Step 1: Enter Username
enterBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if(name){
    username = name;
    displayUsername.textContent = username;
    loginContainer.style.display = 'none';
    groupContainer.style.display = 'block';
  }
});

// Step 2: Create Group
createGroupBtn.addEventListener('click', () => {
  const groupName = groupInput.value.trim();
  if(groupName){
    currentGroup = groupName;
    startChat();
  }
});

// Step 3: Join Group
joinGroupBtn.addEventListener('click', () => {
  const groupName = groupInput.value.trim();
  if(groupName){
    currentGroup = groupName;
    startChat();
  }
});

// Start Chat
function startChat(){
  groupContainer.style.display = 'none';
  chatContainer.style.display = 'block';
  chatBox.innerHTML = '';
  document.getElementById('currentGroup').textContent = currentGroup;

  groupRef = ref(db, 'groups/' + currentGroup + '/messages');

  // Listen for new messages
  onChildAdded(groupRef, snapshot => {
    const msg = snapshot.val();
    const msgDiv = document.createElement('div');
    msgDiv.textContent = msg.username + ': ' + msg.text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Send message
sendBtn.addEventListener('click', () => {
  const text = messageInput.value.trim();
  if(text && groupRef){
    const newMsgRef = push(groupRef);
    set(newMsgRef, {
      username: username,
      text: text,
      timestamp: Date.now()
    });
    messageInput.value = '';
  }
});

// Back to group selection
backBtn.addEventListener('click', () => {
  chatContainer.style.display = 'none';
  groupContainer.style.display = 'block';
  chatBox.innerHTML = '';
  if(groupRef) off(groupRef);
});
