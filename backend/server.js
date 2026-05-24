const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('.')); // serve os HTMLs

io.on('connection', (socket) => {

  socket.on('entrar-balcao', () => {
    socket.join('balcao'); // coloca na sala do balcão
  });

  socket.on('novo-pedido', (pedido) => {
    // retransmite só para quem está na sala do balcão
    io.to('balcao').emit('pedido-recebido', pedido);
  });

});

server.listen(3000, () =>
  console.log('Servidor em http://localhost:3000')
);