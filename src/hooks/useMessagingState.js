import { useReducer, useCallback } from 'react';

// ========================================
// ACTIONS TYPES - Centralisées et typées
// ========================================
export const MESSAGING_ACTIONS = {
  // Navigation
  SET_VIEW: 'SET_VIEW',
  TOGGLE_MOBILE_MENU: 'TOGGLE_MOBILE_MENU',
  TOGGLE_NAVIGATION: 'TOGGLE_NAVIGATION',
  
  // Conversation
  SELECT_CONVERSATION: 'SELECT_CONVERSATION',
  CLEAR_SELECTED_CONVERSATION: 'CLEAR_SELECTED_CONVERSATION',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  DELETE_MESSAGE: 'DELETE_MESSAGE',
  
  // Search & Filter
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  SET_FILTER_TYPE: 'SET_FILTER_TYPE',
  CLEAR_SEARCH: 'CLEAR_SEARCH',
  
  // UI States
  SET_LOADING_MESSAGES: 'SET_LOADING_MESSAGES',
  SET_NEW_MESSAGE: 'SET_NEW_MESSAGE',
  CLEAR_NEW_MESSAGE: 'CLEAR_NEW_MESSAGE',
  
  // Message Selection
  SET_MESSAGE_SELECTION_MODE: 'SET_MESSAGE_SELECTION_MODE',
  SELECT_MESSAGE: 'SELECT_MESSAGE',
  DESELECT_MESSAGE: 'DESELECT_MESSAGE',
  SELECT_ALL_MESSAGES: 'SELECT_ALL_MESSAGES',
  CLEAR_MESSAGE_SELECTION: 'CLEAR_MESSAGE_SELECTION',
  
  // Modals & Confirmations
  SHOW_DELETE_CONFIRM: 'SHOW_DELETE_CONFIRM',
  HIDE_DELETE_CONFIRM: 'HIDE_DELETE_CONFIRM',
  SET_CONVERSATION_TO_DELETE: 'SET_CONVERSATION_TO_DELETE',
  
  // Audio Call
  SHOW_AUDIO_CALL: 'SHOW_AUDIO_CALL',
  HIDE_AUDIO_CALL: 'HIDE_AUDIO_CALL',
  SET_AUDIO_CALL_TARGET: 'SET_AUDIO_CALL_TARGET',
  
  // Mobile Detection
  SET_MOBILE: 'SET_MOBILE',
  
  // Reset
  RESET_STATE: 'RESET_STATE'
};

// ========================================
// ÉTAT INITIAL - Centralisé et typé
// ========================================
const initialState = {
  // Navigation
  currentView: 'list', // 'list' | 'conversation'
  showMobileMenu: false,
  showNavigation: false,
  isMobile: false,
  
  // Conversation
  selectedConversation: null,
  messages: [],
  isLoadingMessages: false,
  newMessage: '',
  
  // Search & Filter
  searchTerm: '',
  filterType: 'all', // 'all' | 'unread' | 'starred' | 'archived'
  
  // Message Selection
  isMessageSelectionMode: false,
  selectedMessages: new Set(),
  longPressTimer: null,
  
  // Modals & Confirmations
  showDeleteConfirm: false,
  conversationToDelete: null,
  
  // Audio Call
  showAudioCall: false,
  audioCallTarget: null
};

// ========================================
// REDUCER - Logique centralisée
// ========================================
const messagingReducer = (state, action) => {
  switch (action.type) {
    // Navigation
    case MESSAGING_ACTIONS.SET_VIEW:
      return {
        ...state,
        currentView: action.payload,
        showMobileMenu: false,
        showNavigation: false
      };
      
    case MESSAGING_ACTIONS.TOGGLE_MOBILE_MENU:
      return {
        ...state,
        showMobileMenu: !state.showMobileMenu,
        showNavigation: false
      };
      
    case MESSAGING_ACTIONS.TOGGLE_NAVIGATION:
      return {
        ...state,
        showNavigation: !state.showNavigation,
        showMobileMenu: false
      };
    
    // Conversation
    case MESSAGING_ACTIONS.SELECT_CONVERSATION:
      return {
        ...state,
        selectedConversation: action.payload,
        currentView: 'conversation',
        showMobileMenu: false,
        showNavigation: false
      };
      
    case MESSAGING_ACTIONS.CLEAR_SELECTED_CONVERSATION:
      return {
        ...state,
        selectedConversation: null,
        messages: [],
        currentView: 'list',
        newMessage: '',
        isMessageSelectionMode: false,
        selectedMessages: new Set()
      };
      
    case MESSAGING_ACTIONS.SET_MESSAGES:
      return {
        ...state,
        messages: action.payload,
        isLoadingMessages: false
      };
      
    case MESSAGING_ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
      
    case MESSAGING_ACTIONS.UPDATE_MESSAGE:
      return {
        ...state,
        messages: state.messages.map(msg => 
          msg.id === action.payload.id ? { ...msg, ...action.payload.updates } : msg
        )
      };
      
    case MESSAGING_ACTIONS.DELETE_MESSAGE:
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload)
      };
    
    // Search & Filter
    case MESSAGING_ACTIONS.SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload
      };
      
    case MESSAGING_ACTIONS.SET_FILTER_TYPE:
      return {
        ...state,
        filterType: action.payload
      };
      
    case MESSAGING_ACTIONS.CLEAR_SEARCH:
      return {
        ...state,
        searchTerm: '',
        filterType: 'all'
      };
    
    // UI States
    case MESSAGING_ACTIONS.SET_LOADING_MESSAGES:
      return {
        ...state,
        isLoadingMessages: action.payload
      };
      
    case MESSAGING_ACTIONS.SET_NEW_MESSAGE:
      return {
        ...state,
        newMessage: action.payload
      };
      
    case MESSAGING_ACTIONS.CLEAR_NEW_MESSAGE:
      return {
        ...state,
        newMessage: ''
      };
    
    // Message Selection
    case MESSAGING_ACTIONS.SET_MESSAGE_SELECTION_MODE:
      return {
        ...state,
        isMessageSelectionMode: action.payload,
        selectedMessages: action.payload ? new Set() : new Set()
      };
      
    case MESSAGING_ACTIONS.SELECT_MESSAGE:
      return {
        ...state,
        selectedMessages: new Set([...state.selectedMessages, action.payload])
      };
      
    case MESSAGING_ACTIONS.DESELECT_MESSAGE:
      const newSelected = new Set(state.selectedMessages);
      newSelected.delete(action.payload);
      return {
        ...state,
        selectedMessages: newSelected
      };
      
    case MESSAGING_ACTIONS.SELECT_ALL_MESSAGES:
      return {
        ...state,
        selectedMessages: new Set(state.messages.map(msg => msg.id))
      };
      
    case MESSAGING_ACTIONS.CLEAR_MESSAGE_SELECTION:
      return {
        ...state,
        selectedMessages: new Set(),
        isMessageSelectionMode: false
      };
    
    // Modals & Confirmations
    case MESSAGING_ACTIONS.SHOW_DELETE_CONFIRM:
      return {
        ...state,
        showDeleteConfirm: true,
        conversationToDelete: action.payload
      };
      
    case MESSAGING_ACTIONS.HIDE_DELETE_CONFIRM:
      return {
        ...state,
        showDeleteConfirm: false,
        conversationToDelete: null
      };
    
    // Audio Call
    case MESSAGING_ACTIONS.SHOW_AUDIO_CALL:
      return {
        ...state,
        showAudioCall: true,
        audioCallTarget: action.payload
      };
      
    case MESSAGING_ACTIONS.HIDE_AUDIO_CALL:
      return {
        ...state,
        showAudioCall: false,
        audioCallTarget: null
      };
      
    case MESSAGING_ACTIONS.SET_AUDIO_CALL_TARGET:
      return {
        ...state,
        audioCallTarget: action.payload
      };
    
    // Mobile Detection
    case MESSAGING_ACTIONS.SET_MOBILE:
      return {
        ...state,
        isMobile: action.payload
      };
    
    // Reset
    case MESSAGING_ACTIONS.RESET_STATE:
      return initialState;
    
    default:
      return state;
  }
};

// ========================================
// HOOK PERSONNALISÉ - Interface simplifiée
// ========================================
export const useMessagingState = () => {
  const [state, dispatch] = useReducer(messagingReducer, initialState);
  
  // ========================================
  // ACTIONS CRÉATEURS - Fonctions optimisées
  // ========================================
  
  // Navigation Actions
  const setView = useCallback((view) => {
    dispatch({ type: MESSAGING_ACTIONS.SET_VIEW, payload: view });
  }, []);
  
  const toggleMobileMenu = useCallback(() => {
    dispatch({ type: MESSAGING_ACTIONS.TOGGLE_MOBILE_MENU });
  }, []);
  
  const toggleNavigation = useCallback(() => {
    dispatch({ type: MESSAGING_ACTIONS.TOGGLE_NAVIGATION });
  }, []);
  
  // Conversation Actions
  const selectConversation = useCallback((conversation) => {
    dispatch({ type: MESSAGING_ACTIONS.SELECT_CONVERSATION, payload: conversation });
  }, []);
  
  const clearSelectedConversation = useCallback(() => {
    dispatch({ type: MESSAGING_ACTIONS.CLEAR_SELECTED_CONVERSATION });
  }, []);
  
  const setMessages = useCallback((messages) => {
    dispatch({ type: MESSAGING_ACTIONS.SET_MESSAGES, payload: messages });
  }, []);
  
  const addMessage = useCallback((message) => {
    dispatch({ type: MESSAGING_ACTIONS.ADD_MESSAGE, payload: message });
  }, []);
  
  const updateMessage = useCallback((messageId, updates) => {
    dispatch({ 
      type: MESSAGING_ACTIONS.UPDATE_MESSAGE, 
      payload: { id: messageId, updates } 
    });
  }, []);
  
  const deleteMessage = useCallback((messageId) => {
    dispatch({ type: MESSAGING_ACTIONS.DELETE_MESSAGE, payload: messageId });
  }, []);
  
  // Search & Filter Actions
  const setSearchTerm = useCallback((term) => {
    dispatch({ type: MESSAGING_ACTIONS.SET_SEARCH_TERM, payload: term });
  }, []);
  
  const setFilterType = useCallback((type) => {
    dispatch({ type: MESSAGING_ACTIONS.SET_FILTER_TYPE, payload: type });
  }, []);
  
  const clearSearch = useCallback(() => {
    dispatch({ type: MESSAGING_ACTIONS.CLEAR_SEARCH });
  }, []);
  
  // UI Actions
  const setLoadingMessages = useCallback((loading) => {
    dispatch({ type: MESSAGING_ACTIONS.SET_LOADING_MESSAGES, payload: loading });
  }, []);
  
  const setNewMessage = useCallback((message) => {
    dispatch({ type: MESSAGING_ACTIONS.SET_NEW_MESSAGE, payload: message });
  }, []);
  
  const clearNewMessage = useCallback(() => {
    dispatch({ type: MESSAGING_ACTIONS.CLEAR_NEW_MESSAGE });
  }, []);
  
  // Message Selection Actions
  const setMessageSelectionMode = useCallback((enabled) => {
    dispatch({ type: MESSAGING_ACTIONS.SET_MESSAGE_SELECTION_MODE, payload: enabled });
  }, []);
  
  const selectMessage = useCallback((messageId) => {
    dispatch({ type: MESSAGING_ACTIONS.SELECT_MESSAGE, payload: messageId });
  }, []);
  
  const deselectMessage = useCallback((messageId) => {
    dispatch({ type: MESSAGING_ACTIONS.DESELECT_MESSAGE, payload: messageId });
  }, []);
  
  const selectAllMessages = useCallback(() => {
    dispatch({ type: MESSAGING_ACTIONS.SELECT_ALL_MESSAGES });
  }, []);
  
  const clearMessageSelection = useCallback(() => {
    dispatch({ type: MESSAGING_ACTIONS.CLEAR_MESSAGE_SELECTION });
  }, []);
  
  // Modal Actions
  const showDeleteConfirm = useCallback((conversation) => {
    dispatch({ type: MESSAGING_ACTIONS.SHOW_DELETE_CONFIRM, payload: conversation });
  }, []);
  
  const hideDeleteConfirm = useCallback(() => {
    dispatch({ type: MESSAGING_ACTIONS.HIDE_DELETE_CONFIRM });
  }, []);
  
  // Audio Call Actions
  const showAudioCall = useCallback((target) => {
    dispatch({ type: MESSAGING_ACTIONS.SHOW_AUDIO_CALL, payload: target });
  }, []);
  
  const hideAudioCall = useCallback(() => {
    dispatch({ type: MESSAGING_ACTIONS.HIDE_AUDIO_CALL });
  }, []);
  
  const setAudioCallTarget = useCallback((target) => {
    dispatch({ type: MESSAGING_ACTIONS.SET_AUDIO_CALL_TARGET, payload: target });
  }, []);
  
  // Mobile Detection
  const setMobile = useCallback((isMobile) => {
    dispatch({ type: MESSAGING_ACTIONS.SET_MOBILE, payload: isMobile });
  }, []);
  
  // Reset
  const resetState = useCallback(() => {
    dispatch({ type: MESSAGING_ACTIONS.RESET_STATE });
  }, []);
  
  // ========================================
  // ACTIONS COMPOSÉES - Logique métier
  // ========================================
  
  // Navigation composée
  const navigateToConversation = useCallback((conversation) => {
    selectConversation(conversation);
    setView('conversation');
  }, [selectConversation, setView]);
  
  const navigateBackToList = useCallback(() => {
    clearSelectedConversation();
    setView('list');
  }, [clearSelectedConversation, setView]);
  
  // Message selection composée
  const toggleMessageSelection = useCallback((messageId) => {
    if (state.selectedMessages.has(messageId)) {
      deselectMessage(messageId);
    } else {
      selectMessage(messageId);
    }
  }, [state.selectedMessages, selectMessage, deselectMessage]);
  
  const startMessageSelection = useCallback((messageId) => {
    setMessageSelectionMode(true);
    selectMessage(messageId);
  }, [setMessageSelectionMode, selectMessage]);
  
  // ========================================
  // RETURN - Interface simplifiée
  // ========================================
  return {
    // État
    state,
    
    // Navigation
    setView,
    toggleMobileMenu,
    toggleNavigation,
    navigateToConversation,
    navigateBackToList,
    
    // Conversation
    selectConversation,
    clearSelectedConversation,
    setMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    
    // Search & Filter
    setSearchTerm,
    setFilterType,
    clearSearch,
    
    // UI
    setLoadingMessages,
    setNewMessage,
    clearNewMessage,
    
    // Message Selection
    setMessageSelectionMode,
    selectMessage,
    deselectMessage,
    selectAllMessages,
    clearMessageSelection,
    toggleMessageSelection,
    startMessageSelection,
    
    // Modals
    showDeleteConfirm,
    hideDeleteConfirm,
    
    // Audio Call
    showAudioCall,
    hideAudioCall,
    setAudioCallTarget,
    
    // Mobile
    setMobile,
    
    // Reset
    resetState
  };
};

export default useMessagingState;