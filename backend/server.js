const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const projectRoutes = require('./routes/projectRoutes');
const batchRoutes = require('./routes/batchRoutes');
const socketSetup = require('./socket/socket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload folders setup
const uploadDir = path.join(__dirname, 'uploads');
const batchesDir = path.join(uploadDir, 'batches');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(batchesDir)) fs.mkdirSync(batchesDir);
//pas websocket for real time updates
const batchController = require('./controllers/batchController');
batchController.setSocketIO(io);
// Routes
app.use(projectRoutes);
app.use(batchRoutes);

// WebSocket
socketSetup(io);

// Start Server
server.listen(PORT, () => {
    console.log(`✅ Server running: http://localhost:${PORT}`);
});
