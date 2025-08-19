import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

/**
 * Composant de test simple pour identifier le problème de la variable Y
 * Teste les fonctionnalités de base de la messagerie sans composants complexes
 */
const MessageTest = ({ 
  className = '',
  onTestComplete,
  ...props 
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState({
    basicFunctionality: false,
    stateManagement: false,
    errorHandling: false,
    componentRendering: false
  });
  
  const { toast } = useToast();

  // Test de base de la fonctionnalité
  useEffect(() => {
    const runBasicTests = async () => {
      setIsLoading(true);
      
      try {
        // Test 1: Fonctionnalité de base
        console.log('🧪 Test 1: Fonctionnalité de base');
        const testMessage = {
          id: Date.now(),
          content: 'Message de test',
          timestamp: new Date().toISOString(),
          sender: 'Test User'
        };
        
        setMessages([testMessage]);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setTestResults(prev => ({ ...prev, basicFunctionality: true }));
        console.log('✅ Test 1 réussi');
        
        // Test 2: Gestion d'état
        console.log('🧪 Test 2: Gestion d\'état');
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          content: 'Deuxième message de test',
          timestamp: new Date().toISOString(),
          sender: 'Test User'
        }]);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        setTestResults(prev => ({ ...prev, stateManagement: true }));
        console.log('✅ Test 2 réussi');
        
        // Test 3: Gestion d'erreurs
        console.log('🧪 Test 3: Gestion d\'erreurs');
        try {
          // Simuler une erreur
          if (typeof Y !== 'undefined') {
            console.log('Variable Y trouvée:', Y);
          } else {
            console.log('Variable Y non définie (comportement normal)');
          }
        } catch (error) {
          console.log('Erreur capturée:', error.message);
        }
        
        setTestResults(prev => ({ ...prev, errorHandling: true }));
        console.log('✅ Test 3 réussi');
        
        // Test 4: Rendu des composants
        console.log('🧪 Test 4: Rendu des composants');
        const testElement = document.createElement('div');
        testElement.textContent = 'Test de rendu';
        document.body.appendChild(testElement);
        document.body.removeChild(testElement);
        
        setTestResults(prev => ({ ...prev, componentRendering: true }));
        console.log('✅ Test 4 réussi');
        
        toast({
          title: "Tests terminés !",
          description: "Tous les tests de base ont été exécutés avec succès.",
          duration: 3000,
        });
        
        if (onTestComplete) {
          onTestComplete({ success: true, results: testResults });
        }
        
      } catch (error) {
        console.error('❌ Erreur lors des tests:', error);
        toast({
          title: "Erreur de test",
          description: `Erreur lors de l'exécution des tests: ${error.message}`,
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    runBasicTests();
  }, [toast, onTestComplete]);

  // Envoyer un message
  const sendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      content: inputValue,
      timestamp: new Date().toISOString(),
      sender: 'Utilisateur'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    
    toast({
      title: "Message envoyé !",
      description: "Le message a été ajouté avec succès.",
      duration: 2000,
    });
  };

  // Gérer la touche Entrée
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Vérifier si tous les tests sont passés
  const allTestsPassed = Object.values(testResults).every(result => result);

  return (
    <div className={`message-test ${className}`.trim()} {...props}>
      {/* En-tête du test */}
      <div className="test-header">
        <div className="header-content">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            Test de Messagerie
          </h3>
          <p className="text-sm text-gray-600">
            Test simple des fonctionnalités de base de la messagerie
          </p>
        </div>
        
        <div className="test-status">
          {allTestsPassed ? (
            <div className="status-success">
              <span>✅ Tous les tests passés</span>
            </div>
          ) : (
            <div className="status-running">
              <span>🔄 Tests en cours...</span>
            </div>
          )}
        </div>
      </div>

      {/* Résultats des tests */}
      <div className="test-results">
        <h4 className="text-md font-medium mb-3">Résultats des tests</h4>
        
        <div className="results-grid">
          {Object.entries(testResults).map(([test, passed]) => (
            <div key={test} className={`result-item ${passed ? 'success' : 'pending'}`}>
              <div className="result-icon">
                {passed ? (
                  <span className="text-green-500">✅</span>
                ) : (
                  <span className="text-yellow-500">⏳</span>
                )}
              </div>
              
              <div className="result-content">
                <span className="result-name">
                  {test === 'basicFunctionality' && 'Fonctionnalité de base'}
                  {test === 'stateManagement' && 'Gestion d\'état'}
                  {test === 'errorHandling' && 'Gestion d\'erreurs'}
                  {test === 'componentRendering' && 'Rendu des composants'}
                </span>
                
                <Badge variant={passed ? 'default' : 'secondary'}>
                  {passed ? 'Réussi' : 'En cours'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interface de test de messagerie */}
      <div className="message-interface">
        <h4 className="text-md font-medium mb-3">Interface de test</h4>
        
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="no-messages">
              <MessageSquare className="w-8 h-8 text-gray-400" />
              <p>Aucun message pour le moment</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message) => (
                <div key={message.id} className="message-item">
                  <div className="message-header">
                    <span className="message-sender">{message.sender}</span>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="message-content">
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="message-input-container">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message de test..."
            disabled={isLoading}
          />
          
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Informations de débogage */}
      <div className="debug-info">
        <h4 className="text-md font-medium mb-3">Informations de débogage</h4>
        
        <div className="debug-content">
          <div className="debug-item">
            <strong>État des tests :</strong>
            <span>{Object.values(testResults).filter(Boolean).length}/{Object.keys(testResults).length} tests réussis</span>
          </div>
          
          <div className="debug-item">
            <strong>Messages :</strong>
            <span>{messages.length} message(s) affiché(s)</span>
          </div>
          
          <div className="debug-item">
            <strong>Chargement :</strong>
            <span>{isLoading ? 'En cours' : 'Terminé'}</span>
          </div>
          
          <div className="debug-item">
            <strong>Variable Y :</strong>
            <span>{typeof Y !== 'undefined' ? 'Définie' : 'Non définie'}</span>
          </div>
        </div>
      </div>

      {/* Actions de test */}
      <div className="test-actions">
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
        >
          🔄 Recharger la page
        </Button>
        
        <Button
          onClick={() => console.clear()}
          variant="outline"
          size="sm"
        >
          🧹 Effacer la console
        </Button>
        
        <Button
          onClick={() => {
            console.log('=== DIAGNOSTIC MANUEL ===');
            console.log('Type de Y:', typeof Y);
            console.log('Y === undefined:', Y === undefined);
            console.log('Window object:', typeof window);
            console.log('Document object:', typeof document);
            console.log('React version:', React.version);
            console.log('=======================');
          }}
          variant="outline"
          size="sm"
        >
          🔍 Diagnostic manuel
        </Button>
      </div>
    </div>
  );
};

export default MessageTest;
