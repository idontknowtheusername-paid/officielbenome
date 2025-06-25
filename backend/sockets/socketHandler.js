// Exemple de gestion WebSocket avec socket.io
import { Server } from 'socket.io';

export const initSocket = (server) => {
  const io = new Server(server, { cors: { origin: '*' } });
  io.on('connection', (socket) => {
    console.log('Nouvelle connexion socket:', socket.id);
    // ... gestion des événements personnalisés ...
  });
  return io;
};
