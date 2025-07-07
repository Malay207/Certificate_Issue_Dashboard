module.exports = function (io) {
    io.on('connection', socket => {
        console.log('Client connected');
        socket.on('disconnect', () => console.log('Client disconnected'));
    });
};