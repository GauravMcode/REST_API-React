let io;

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer, {
            cors: {  //setting up cors
                origin: '*',
                methods: ["GET", "POST"]
            }
        })
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io is not initialized')
        }
        return io
    }
}