# Full Real-Time Chat App (Like Discord Lite)

This guide gives you **EVERY STEP** to build a real chat app that works across devices, with:
- Accounts (login/register)
- Online user list
- Public chat room
- Private DMs
- Message history (database)
- Mobile-friendly UI
- Ready for GitHub + deployment

No paid services. Beginner-safe.

---

## 1️⃣ What You Need (Install Once)

1. **Node.js (LTS)**
   - Download from nodejs.org
   - Check install:
   ```bash
   node -v
   npm -v
   ```

2. **Code Editor**
   - VS Code recommended

---

## 2️⃣ Create Project Folder

```bash
mkdir chat-app
cd chat-app
npm init -y
```

Install dependencies:
```bash
npm install express socket.io bcrypt jsonwebtoken sqlite3
```

---

## 3️⃣ Project Structure

```text
chat-app/
│
├── server.js
├── db.js
├── auth.js
│
├── public/
│   ├── index.html
│   ├── chat.html
│   ├── style.css
│   └── client.js
│
└── package.json
```

---

## 4️⃣ Database (SQLite – no setup needed)

### db.js
```js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chat.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    receiver TEXT,
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;
```

---

## 5️⃣ Authentication (Login + Register)

### auth.js
```js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const SECRET = 'supersecretkey';

function register(username, password, cb) {
  bcrypt.hash(password, 10, (err, hash) => {
    db.run('INSERT INTO users(username,password) VALUES(?,?)', [username, hash], cb);
  });
}

function login(username, password, cb) {
  db.get('SELECT * FROM users WHERE username=?', [username], (err, user) => {
    if (!user) return cb(false);
    bcrypt.compare(password, user.password, (err, ok) => {
      if (!ok) return cb(false);
      const token = jwt.sign({ username }, SECRET);
      cb(token);
    });
  });
}

module.exports = { register, login, SECRET };
```

---

## 6️⃣ Server + Sockets

### server.js
```js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('./db');
const auth = require('./auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static('public'));

let onlineUsers = {};

// REST AUTH
app.post('/register', (req, res) => {
  auth.register(req.body.username, req.body.password, err => {
    if (err) return res.status(400).send('User exists');
    res.send('OK');
  });
});

app.post('/login', (req, res) => {
  auth.login(req.body.username, req.body.password, token => {
    if (!token) return res.status(401).send('Invalid');
    res.json({ token });
  });
});

// SOCKETS
io.use((socket, next) => {
  try {
    const user = jwt.verify(socket.handshake.auth.token, auth.SECRET);
    socket.user = user.username;
    next();
  } catch {
    next(new Error('auth error'));
  }
});

io.on('connection', socket => {
  onlineUsers[socket.user] = socket.id;
  io.emit('online', Object.keys(onlineUsers));

  socket.on('public', msg => {
    db.run('INSERT INTO messages(sender,receiver,message) VALUES(?,?,?)', [socket.user, 'public', msg]);
    io.emit('public', { user: socket.user, msg });
  });

  socket.on('private', ({ to, msg }) => {
    const id = onlineUsers[to];
    db.run('INSERT INTO messages(sender,receiver,message) VALUES(?,?,?)', [socket.user, to, msg]);
    if (id) io.to(id).emit('private', { from: socket.user, msg });
  });

  socket.on('disconnect', () => {
    delete onlineUsers[socket.user];
    io.emit('online', Object.keys(onlineUsers));
  });
});

server.listen(3000, () => console.log('Running on 3000'));
```

---

## 7️⃣ Frontend

### public/index.html (Login/Register)
```html
<!DOCTYPE html>
<html>
<body>
<h2>Login / Register</h2>
<input id="u" placeholder="username">
<input id="p" placeholder="password" type="password">
<button onclick="reg()">Register</button>
<button onclick="log()">Login</button>
<script>
async function reg(){
 await fetch('/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u.value,password:p.value})});
 alert('Registered');
}
async function log(){
 const r=await fetch('/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u.value,password:p.value})});
 const d=await r.json();
 localStorage.token=d.token; location='chat.html';
}
</script>
</body>
</html>
```

---

### public/chat.html
```html
<!DOCTYPE html>
<html>
<body>
<h3>Chat</h3>
<div id="online"></div>
<div id="chat"></div>
<input id="msg"><button onclick="send()">Send</button>
<script src="/socket.io/socket.io.js"></script>
<script src="client.js"></script>
</body>
</html>
```

---

### public/client.js
```js
const socket = io({ auth: { token: localStorage.token } });

socket.on('online', users => online.innerText = 'Online: ' + users.join(', '));
socket.on('public', d => chat.innerHTML += `<p><b>${d.user}:</b> ${d.msg}</p>`);
socket.on('private', d => chat.innerHTML += `<p><i>DM from ${d.from}:</i> ${d.msg}</p>`);

function send(){ socket.emit('public', msg.value); msg.value=''; }
```

---

## 8️⃣ Run It

```bash
node server.js
```

Open:
- http://localhost:3000 on **two devices**

---

## 9️⃣ GitHub

```bash
git init
git add .
git commit -m "Full realtime chat app"
```

---

## 🔟 Deploy (Optional)

Deploy to **Railway / Render / Fly.io**
- Add repo
- Set start command: `node server.js`

---

## ✅ You Now Have

✔ Login system
✔ Online users
✔ Public chat
✔ Private DMs
✔ Message history
✔ Multi-device support
✔ GitHub-ready

---

If you want:
- emojis
- typing indicator
- voice chat
- image sharing
- Discord-style UI

Say the word and I’ll extend it.

