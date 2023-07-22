const express = require('express');
const dotenv = require('dotenv');
const { chats } = require('./data/data');
const connectDB = require('./config/db');
const useRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const cors = require('cors');
const { notFound, errorHandler } = require('./middlewares/errorMiddlewares');
const path = require('path');

const app = express();
app.use(
  cors({
    origin: [
      'https://chat-app-frontend-parthsawant2001.vercel.app',
      'https://chat-app-frontend-git-main-parthsawant2001.vercel.app',
      'https://chat-app-frontend-rho.vercel.app',
      'https://chat-app-frontend-2bvtovz3n-parthsawant2001.vercel.app',
      'http://localhost:3001',
    ],
  })
);
app.use(express.json());
dotenv.config();
connectDB();
const PORT = process.env.PORT || 3000;

// app.get('/', (req, res) => {
//   res.send('Api is running');
// });

// app.use(notFound);
app.use(errorHandler);

app.use('/api/user', useRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

const server = app.listen(PORT, console.log(`Server running on PORT:${PORT}`));

const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: [
    'https://chat-app-frontend-parthsawant2001.vercel.app',
    'https://chat-app-frontend-git-main-parthsawant2001.vercel.app',
    'https://chat-app-frontend-rho.vercel.app',
    'https://chat-app-frontend-2bvtovz3n-parthsawant2001.vercel.app',
    'http://localhost:3001',
  ],
});

io.on('connection', (socket) => {
  console.log('connected to socket.io');
  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('user join room:' + room);
    socket.emit('connected');
  });

  socket.on('typing', (room) => {
    socket.in(room).emit('typing');
  });
  socket.on('stop typing', (room) => {
    socket.in(room).emit('stop typing');
  });

  socket.on('new message', (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log('chat.users not defined');
    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      socket.in(user._id).emit('message received', newMessageRecieved);
    });
  });

  socket.off('setup', () => {
    console.log('disconnected');
    socket.leave(userData._id);
  });
});
