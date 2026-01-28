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
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// Send message
sendBtn.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (message !== '') {
    const newMessage = db.ref('messages').push();
    newMessage.set({
      text: message,
      timestamp: Date.now()
    });
    messageInput.value = '';
  }
});

// Listen for new messages
db.ref('messages').on('child_added', (snapshot) => {
  const msg = snapshot.val();
  const msgDiv = document.createElement('div');
  msgDiv.textContent = msg.text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});
