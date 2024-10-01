const socket = io();

const cursorContainer = document.getElementById('cursor-container');
const cursors = new Map();

function createCursor(user) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.style.left = '-10px';
    cursor.style.top = '-10px';
    cursorContainer.appendChild(cursor);
    return cursor;
}

socket.on('users', (users) => {
    users.forEach((user) => {
        if (!cursors.has(user.id)) {
            cursors.set(user.id, createCursor(user));
        }
    });
});

socket.on('user joined', (user) => {
    if (!cursors.has(user.id)) {
        cursors.set(user.id, createCursor(user));
    }
});

socket.on('cursor update', (user) => {
    const cursor = cursors.get(user.id);
    if (cursor && user.x !== undefined && user.y !== undefined) {
        cursor.style.left = `${user.x}px`;
        cursor.style.top = `${user.y}px`;
    }
});

socket.on('user left', (userId) => {
    const cursor = cursors.get(userId);
    if (cursor) {
        cursorContainer.removeChild(cursor);
        cursors.delete(userId);
    }
});

let lastX = -1;
let lastY = -1;

document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    if (x !== lastX || y !== lastY) {
        socket.emit('cursor move', { x, y });
        lastX = x;
        lastY = y;
    }
});

const chatInput = document.getElementById('chat-input');
const messages = document.getElementById('messages');

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && chatInput.value.trim() !== '') {
        const message = chatInput.value.trim();
        socket.emit('chat message', message);
        chatInput.value = '';
    }
});

socket.on('chat message', (msg) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = msg;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
});
