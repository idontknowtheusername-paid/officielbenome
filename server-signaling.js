// Serveur de signalisation simple pour les appels WebRTC
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Stockage des utilisateurs connectés
const connectedUsers = new Map();
const activeCalls = new Map();

// Gestion des connexions socket
io.on('connection', (socket) => {
  console.log(`Utilisateur connecté: ${socket.id}`);

  // Rejoindre une salle
  socket.on('join-room', (data) => {
    const { userId, roomId } = data;
    
    socket.join(roomId);
    connectedUsers.set(socket.id, { userId, roomId });
    
    console.log(`Utilisateur ${userId} a rejoint la salle ${roomId}`);
    
    // Notifier les autres utilisateurs de la salle
    socket.to(roomId).emit('user-joined', { userId, socketId: socket.id });
  });

  // Démarrer un appel
  socket.on('start-call', (data) => {
    const { targetUserId, roomId, callerId } = data;
    
    console.log(`Appel démarré de ${callerId} vers ${targetUserId} dans la salle ${roomId}`);
    
    // Notifier la cible de l'appel entrant
    socket.to(roomId).emit('incoming-call', {
      callerId: socket.id,
      targetUserId,
      roomId
    });
    
    // Enregistrer l'appel actif
    activeCalls.set(roomId, {
      callerId: socket.id,
      targetUserId,
      roomId,
      status: 'calling',
      startTime: Date.now()
    });
  });

  // Répondre à un appel
  socket.on('answer-call', (data) => {
    const { callerId, roomId, answererId } = data;
    
    console.log(`Appel répondu par ${answererId} à ${callerId} dans la salle ${roomId}`);
    
    // Notifier l'appelant que l'appel a été répondu
    io.to(callerId).emit('call-answered', {
      answererId: socket.id,
      roomId
    });
    
    // Mettre à jour le statut de l'appel
    const call = activeCalls.get(roomId);
    if (call) {
      call.status = 'connected';
      call.answererId = socket.id;
    }
  });

  // Refuser un appel
  socket.on('reject-call', (data) => {
    const { callerId, roomId, rejecterId } = data;
    
    console.log(`Appel refusé par ${rejecterId} à ${callerId} dans la salle ${roomId}`);
    
    // Notifier l'appelant que l'appel a été refusé
    io.to(callerId).emit('call-rejected', {
      rejecterId: socket.id,
      roomId
    });
    
    // Supprimer l'appel actif
    activeCalls.delete(roomId);
  });

  // Terminer un appel
  socket.on('end-call', (data) => {
    const { enderId, roomId } = data;
    
    console.log(`Appel terminé par ${enderId} dans la salle ${roomId}`);
    
    // Notifier tous les participants de la salle
    io.to(roomId).emit('call-ended', {
      enderId: socket.id,
      roomId
    });
    
    // Supprimer l'appel actif
    activeCalls.delete(roomId);
  });

  // Signal WebRTC
  socket.on('webrtc-signal', (data) => {
    const { signal, targetId } = data;
    
    // Transférer le signal WebRTC au destinataire
    io.to(targetId).emit('webrtc-signal', {
      signal,
      fromId: socket.id
    });
  });

  // Déconnexion
  socket.on('disconnect', () => {
    const userInfo = connectedUsers.get(socket.id);
    
    if (userInfo) {
      console.log(`Utilisateur déconnecté: ${userInfo.userId} de la salle ${userInfo.roomId}`);
      
      // Vérifier s'il y a un appel actif et le terminer
      const call = activeCalls.get(userInfo.roomId);
      if (call && (call.callerId === socket.id || call.answererId === socket.id)) {
        io.to(userInfo.roomId).emit('call-ended', {
          enderId: socket.id,
          roomId: userInfo.roomId,
          reason: 'disconnection'
        });
        activeCalls.delete(userInfo.roomId);
      }
      
      connectedUsers.delete(socket.id);
    }
  });
});

// Routes API
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    connectedUsers: connectedUsers.size,
    activeCalls: activeCalls.size
  });
});

app.get('/stats', (req, res) => {
  res.json({
    connectedUsers: Array.from(connectedUsers.values()),
    activeCalls: Array.from(activeCalls.values())
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Serveur de signalisation démarré sur le port ${PORT}`);
  console.log(`📡 Prêt pour les appels WebRTC`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Stats: http://localhost:${PORT}/stats`);
});

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  console.log('🛑 Arrêt gracieux du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Arrêt gracieux du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});
