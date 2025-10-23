import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { error } from 'console';

configDotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes will be added here
app.get('/', (req, res) => {
    res.json({ message: "Chat App API" });
});

// socket.io connection
io.on('connection', (socket) => {
    console.log('User connected', socket.id);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('send_message', (data) => {
        socket.to(data.room).emit('receive_message', data);
    });

    socket.on('disconnected', () => {
        console.log('User disconnected', socket.id);
    })
});

// MongoDB connection
const PORT = process.env.PORT || 50000;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:')
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is running on ${PORT}`);
        });
    })
    .catch(() => {
        console.log('Database connection failed:', error);
    });