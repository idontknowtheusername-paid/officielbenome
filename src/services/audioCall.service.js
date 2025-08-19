// Service de gestion des appels audio via WebRTC
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';

class AudioCallService {
  constructor() {
    this.socket = null;
    this.peer = null;
    this.localStream = null;
    this.remoteStream = null;
    this.callState = 'idle'; // idle, calling, incoming, connected, ended
    this.callDuration = 0;
    this.callTimer = null;
    this.callStartTime = null;
    
    // Callbacks
    this.onCallStateChange = null;
    this.onRemoteStream = null;
    this.onCallDuration = null;
    this.onError = null;
    
    // Configuration
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ],
      audio: true,
      video: false
    };
  }

  // Initialiser la connexion socket
  async initialize(userId, roomId) {
    try {
      // Connexion au serveur de signalisation
      this.socket = io(process.env.REACT_APP_SIGNALING_SERVER || 'http://localhost:3001', {
        query: { userId, roomId }
      });

      this.setupSocketListeners();
      
      // Demander l'accès au microphone
      await this.requestAudioPermission();
      
      return true;
    } catch (error) {
      console.error('Erreur initialisation AudioCall:', error);
      this.handleError(error);
      return false;
    }
  }

  // Demander l'accès au microphone
  async requestAudioPermission() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        },
        video: false
      });
      
      console.log('Accès microphone accordé');
      return true;
    } catch (error) {
      console.error('Erreur accès microphone:', error);
      throw new Error('Accès au microphone refusé. Veuillez autoriser l\'accès audio.');
    }
  }

  // Configurer les écouteurs socket
  setupSocketListeners() {
    if (!this.socket) return;

    // Réception d'un appel entrant
    this.socket.on('incoming-call', (data) => {
      console.log('Appel entrant de:', data.callerId);
      this.callState = 'incoming';
      this.triggerCallStateChange();
    });

    // Réponse à un appel
    this.socket.on('call-answered', (data) => {
      console.log('Appel répondu par:', data.answererId);
      this.handleCallAnswered(data);
    });

    // Appel refusé
    this.socket.on('call-rejected', (data) => {
      console.log('Appel refusé par:', data.rejecterId);
      this.callState = 'ended';
      this.triggerCallStateChange();
      this.cleanup();
    });

    // Appel terminé
    this.socket.on('call-ended', (data) => {
      console.log('Appel terminé par:', data.enderId);
      this.endCall();
    });

    // Signal WebRTC
    this.socket.on('webrtc-signal', (data) => {
      if (this.peer) {
        this.peer.signal(data.signal);
      }
    });

    // Connexion établie
    this.socket.on('connect', () => {
      console.log('Connecté au serveur de signalisation');
    });

    // Déconnexion
    this.socket.on('disconnect', () => {
      console.log('Déconnecté du serveur de signalisation');
      this.handleError(new Error('Connexion perdue au serveur'));
    });
  }

  // Démarrer un appel
  async startCall(targetUserId, roomId) {
    try {
      if (this.callState !== 'idle') {
        throw new Error('Un appel est déjà en cours');
      }

      if (!this.localStream) {
        await this.requestAudioPermission();
      }

      this.callState = 'calling';
      this.triggerCallStateChange();

      // Créer la connexion peer
      this.peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: this.localStream,
        config: { iceServers: this.config.iceServers }
      });

      this.setupPeerListeners();

      // Envoyer la demande d'appel
      this.socket.emit('start-call', {
        targetUserId,
        roomId,
        callerId: this.socket.id
      });

      return true;
    } catch (error) {
      console.error('Erreur démarrage appel:', error);
      this.handleError(error);
      return false;
    }
  }

  // Répondre à un appel
  async answerCall(callerId, roomId) {
    try {
      if (this.callState !== 'incoming') {
        throw new Error('Aucun appel entrant');
      }

      if (!this.localStream) {
        await this.requestAudioPermission();
      }

      this.callState = 'connected';
      this.triggerCallStateChange();

      // Créer la connexion peer
      this.peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: this.localStream,
        config: { iceServers: this.config.iceServers }
      });

      this.setupPeerListeners();

      // Accepter l'appel
      this.socket.emit('answer-call', {
        callerId,
        roomId,
        answererId: this.socket.id
      });

      this.startCallTimer();
      return true;
    } catch (error) {
      console.error('Erreur réponse appel:', error);
      this.handleError(error);
      return false;
    }
  }

  // Refuser un appel
  rejectCall(callerId, roomId) {
    try {
      this.socket.emit('reject-call', {
        callerId,
        roomId,
        rejecterId: this.socket.id
      });

      this.callState = 'ended';
      this.triggerCallStateChange();
      this.cleanup();
    } catch (error) {
      console.error('Erreur refus appel:', error);
      this.handleError(error);
    }
  }

  // Terminer un appel
  endCall() {
    try {
      if (this.callState === 'connected') {
        this.socket.emit('end-call', {
          enderId: this.socket.id
        });
      }

      this.callState = 'ended';
      this.triggerCallStateChange();
      this.cleanup();
    } catch (error) {
      console.error('Erreur fin appel:', error);
      this.handleError(error);
    }
  }

  // Configurer les écouteurs peer
  setupPeerListeners() {
    if (!this.peer) return;

    // Signal à envoyer
    this.peer.on('signal', (signal) => {
      this.socket.emit('webrtc-signal', { signal });
    });

    // Connexion établie
    this.peer.on('connect', () => {
      console.log('Connexion WebRTC établie');
      this.callState = 'connected';
      this.triggerCallStateChange();
      this.startCallTimer();
    });

    // Flux audio distant reçu
    this.peer.on('stream', (stream) => {
      this.remoteStream = stream;
      if (this.onRemoteStream) {
        this.onRemoteStream(stream);
      }
    });

    // Erreur de connexion
    this.peer.on('error', (error) => {
      console.error('Erreur WebRTC:', error);
      this.handleError(error);
    });

    // Connexion fermée
    this.peer.on('close', () => {
      console.log('Connexion WebRTC fermée');
      this.endCall();
    });
  }

  // Démarrer le minuteur d'appel
  startCallTimer() {
    this.callStartTime = Date.now();
    this.callDuration = 0;
    
    this.callTimer = setInterval(() => {
      this.callDuration = Math.floor((Date.now() - this.callStartTime) / 1000);
      if (this.onCallDuration) {
        this.onCallDuration(this.callDuration);
      }
    }, 1000);
  }

  // Gérer une réponse d'appel
  handleCallAnswered(data) {
    if (this.peer && this.callState === 'calling') {
      this.callState = 'connected';
      this.triggerCallStateChange();
      this.startCallTimer();
    }
  }

  // Nettoyer les ressources
  cleanup() {
    // Arrêter le minuteur
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = null;
    }

    // Fermer la connexion peer
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    // Arrêter le flux local
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Réinitialiser l'état
    this.callState = 'idle';
    this.callDuration = 0;
    this.callStartTime = null;
    this.remoteStream = null;
  }

  // Gérer les erreurs
  handleError(error) {
    console.error('Erreur AudioCall:', error);
    if (this.onError) {
      this.onError(error);
    }
  }

  // Déclencher le changement d'état
  triggerCallStateChange() {
    if (this.onCallStateChange) {
      this.onCallStateChange(this.callState);
    }
  }

  // Formater la durée d'appel
  formatCallDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Obtenir l'état actuel
  getCallState() {
    return {
      state: this.callState,
      duration: this.callDuration,
      formattedDuration: this.formatCallDuration(this.callDuration),
      hasLocalStream: !!this.localStream,
      hasRemoteStream: !!this.remoteStream
    };
  }

  // Vérifier si un appel est en cours
  isInCall() {
    return ['calling', 'incoming', 'connected'].includes(this.callState);
  }

  // Vérifier si l'appel est connecté
  isConnected() {
    return this.callState === 'connected';
  }

  // Déconnecter du serveur
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.cleanup();
  }

  // Définir les callbacks
  setCallbacks(callbacks) {
    this.onCallStateChange = callbacks.onCallStateChange;
    this.onRemoteStream = callbacks.onRemoteStream;
    this.onCallDuration = callbacks.onCallDuration;
    this.onError = callbacks.onError;
  }
}

// Instance singleton
const audioCallService = new AudioCallService();

export default audioCallService;
