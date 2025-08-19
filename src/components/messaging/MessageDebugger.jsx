import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bug, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Composant de débogage pour identifier les problèmes de la messagerie
 * Aide à diagnostiquer l'erreur "Can't find variable: Y"
 */
const MessageDebugger = ({ 
  onErrorResolved,
  className = '',
  ...props 
}) => {
  const [debugInfo, setDebugInfo] = useState({
    errors: [],
    warnings: [],
    info: [],
    variables: {}
  });
  const [isDebugging, setIsDebugging] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  // Capturer les erreurs globales
  useEffect(() => {
    const originalErrorHandler = window.onerror;
    const originalUnhandledRejectionHandler = window.onunhandledrejection;

    window.onerror = (message, source, lineno, colno, error) => {
      console.log('🚨 Erreur capturée:', { message, source, lineno, colno, error });
      
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, {
          type: 'error',
          message: String(message),
          source,
          lineno,
          colno,
          stack: error?.stack,
          timestamp: new Date().toISOString()
        }]
      }));

      // Appeler le gestionnaire original
      if (originalErrorHandler) {
        originalErrorHandler(message, source, lineno, colno, error);
      }
    };

    window.onunhandledrejection = (event) => {
      console.log('🚨 Promesse rejetée:', event.reason);
      
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, {
          type: 'unhandledRejection',
          message: String(event.reason),
          stack: event.reason?.stack,
          timestamp: new Date().toISOString()
        }]
      }));

      // Appeler le gestionnaire original
      if (originalUnhandledRejectionHandler) {
        originalUnhandledRejectionHandler(event);
      }
    };

    return () => {
      window.onerror = originalErrorHandler;
      window.onunhandledrejection = originalUnhandledRejectionHandler;
    };
  }, []);

  // Tests de diagnostic
  const runDiagnostics = async () => {
    setIsDebugging(true);
    setCurrentTest('Vérification des variables globales...');

    try {
      // Test 1: Vérifier les variables globales
      setCurrentTest('Test 1: Variables globales');
      const globalVars = {
        window: typeof window !== 'undefined',
        document: typeof document !== 'undefined',
        console: typeof console !== 'undefined',
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined'
      };

      setDebugInfo(prev => ({
        ...prev,
        variables: { ...prev.variables, global: globalVars }
      }));

      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 2: Vérifier les services de messagerie
      setCurrentTest('Test 2: Services de messagerie');
      try {
        const { messageService } = await import('@/services/message.service');
        setDebugInfo(prev => ({
          ...prev,
          info: [...prev.info, '✅ Service de messagerie chargé avec succès']
        }));
      } catch (error) {
        setDebugInfo(prev => ({
          ...prev,
          errors: [...prev.errors, {
            type: 'serviceError',
            message: `Erreur chargement service messagerie: ${error.message}`,
            timestamp: new Date().toISOString()
          }]
        }));
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 3: Vérifier les composants de messagerie
      setCurrentTest('Test 3: Composants de messagerie');
      const messagingComponents = [
        'MessageInput',
        'CameraCapture',
        'FileUpload',
        'LocationPicker',
        'AppointmentScheduler',
        'AudioCallInterface'
      ];

      for (const componentName of messagingComponents) {
        try {
          const component = await import(`./${componentName}.jsx`);
          setDebugInfo(prev => ({
            ...prev,
            info: [...prev.info, `✅ Composant ${componentName} chargé avec succès`]
          }));
        } catch (error) {
          setDebugInfo(prev => ({
            ...prev,
            errors: [...prev.errors, {
              type: 'componentError',
              message: `Erreur chargement composant ${componentName}: ${error.message}`,
              timestamp: new Date().toISOString()
            }]
          }));
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Test 4: Vérifier les dépendances
      setCurrentTest('Test 4: Dépendances');
      const dependencies = {
        react: typeof React !== 'undefined',
        framerMotion: typeof window !== 'undefined' && window.FramerMotion,
        lucideReact: typeof window !== 'undefined' && window.LucideReact
      };

      setDebugInfo(prev => ({
        ...prev,
        variables: { ...prev.variables, dependencies }
      }));

      // Test 5: Vérifier la console pour des erreurs
      setCurrentTest('Test 5: Analyse de la console');
      const consoleErrors = debugInfo.errors.filter(e => e.type === 'error');
      if (consoleErrors.length > 0) {
        setDebugInfo(prev => ({
          ...prev,
          warnings: [...prev.warnings, `⚠️ ${consoleErrors.length} erreur(s) détectée(s) dans la console`]
        }));
      }

    } catch (error) {
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, {
          type: 'diagnosticError',
          message: `Erreur lors du diagnostic: ${error.message}`,
          timestamp: new Date().toISOString()
        }]
      }));
    } finally {
      setIsDebugging(false);
      setCurrentTest('');
    }
  };

  // Nettoyer les erreurs
  const clearErrors = () => {
    setDebugInfo({
      errors: [],
      warnings: [],
      info: [],
      variables: {}
    });
  };

  // Exporter les informations de débogage
  const exportDebugInfo = () => {
    const dataStr = JSON.stringify(debugInfo, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `message-debug-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Vérifier s'il y a des erreurs liées à la variable Y
  const hasYVariableError = debugInfo.errors.some(error => 
    error.message.includes('Y') || 
    error.message.includes('Can\'t find variable') ||
    error.message.includes('Y is not defined')
  );

  return (
    <div className={`message-debugger ${className}`.trim()} {...props}>
      {/* En-tête du débogueur */}
      <div className="debugger-header">
        <div className="header-content">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bug className="w-5 h-5 text-orange-500" />
            Débogueur de Messagerie
          </h3>
          <p className="text-sm text-gray-600">
            Diagnostic des erreurs et problèmes de la messagerie
          </p>
        </div>
        
        <div className="header-actions">
          <Button
            onClick={runDiagnostics}
            disabled={isDebugging}
            variant="outline"
            size="sm"
          >
            {isDebugging ? 'Diagnostic...' : 'Lancer Diagnostic'}
          </Button>
          
          <Button
            onClick={clearErrors}
            variant="outline"
            size="sm"
          >
            Effacer
          </Button>
          
          <Button
            onClick={exportDebugInfo}
            variant="outline"
            size="sm"
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* Progression du diagnostic */}
      {isDebugging && (
        <div className="diagnostic-progress">
          <div className="progress-info">
            <span>Test en cours : {currentTest}</span>
            <span>Diagnostic en cours...</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Résumé des erreurs */}
      <div className="error-summary">
        <div className="summary-item error">
          <XCircle className="w-4 h-4 text-red-500" />
          <span>{debugInfo.errors.length} erreur(s)</span>
        </div>
        
        <div className="summary-item warning">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <span>{debugInfo.warnings.length} avertissement(s)</span>
        </div>
        
        <div className="summary-item info">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>{debugInfo.info.length} information(s)</span>
        </div>
      </div>

      {/* Détail des erreurs */}
      {debugInfo.errors.length > 0 && (
        <div className="errors-detail">
          <h4 className="text-md font-medium mb-3">Erreurs détectées</h4>
          
          {hasYVariableError && (
            <div className="y-variable-alert">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <strong>🚨 PROBLÈME IDENTIFIÉ : Variable Y non définie</strong>
                <p>Cette erreur indique un problème avec une variable non déclarée.</p>
                <p>Vérifiez les composants de messagerie pour des références à des variables non définies.</p>
              </div>
            </div>
          )}
          
          <div className="errors-list">
            {debugInfo.errors.map((error, index) => (
              <div key={index} className={`error-item ${error.type}`}>
                <div className="error-header">
                  <Badge variant="destructive">{error.type}</Badge>
                  <span className="error-timestamp">
                    {new Date(error.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="error-message">
                  {error.message}
                </div>
                
                {error.source && (
                  <div className="error-source">
                    <strong>Source :</strong> {error.source}
                    {error.lineno && ` (ligne ${error.lineno})`}
                  </div>
                )}
                
                {error.stack && (
                  <details className="error-stack">
                    <summary>Stack trace</summary>
                    <pre>{error.stack}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variables et dépendances */}
      {Object.keys(debugInfo.variables).length > 0 && (
        <div className="variables-info">
          <h4 className="text-md font-medium mb-3">Variables et dépendances</h4>
          
          {Object.entries(debugInfo.variables).map(([category, vars]) => (
            <div key={category} className="variable-category">
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </h5>
              
              <div className="variables-grid">
                {Object.entries(vars).map(([name, value]) => (
                  <div key={name} className="variable-item">
                    <span className="variable-name">{name}:</span>
                    <Badge variant={value ? 'default' : 'destructive'}>
                      {value ? '✅' : '❌'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Informations de débogage */}
      {debugInfo.info.length > 0 && (
        <div className="debug-info">
          <h4 className="text-md font-medium mb-3">Informations de débogage</h4>
          
          <div className="info-list">
            {debugInfo.info.map((info, index) => (
              <div key={index} className="info-item">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{info}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions recommandées */}
      {hasYVariableError && (
        <div className="recommended-actions">
          <h4 className="text-md font-medium mb-3">Actions recommandées</h4>
          
          <div className="actions-list">
            <div className="action-item">
              <strong>1. Vérifier les composants :</strong>
              <p>Rechercher des références à des variables non déclarées dans les composants de messagerie.</p>
            </div>
            
            <div className="action-item">
              <strong>2. Vérifier les imports :</strong>
              <p>S'assurer que tous les composants et services sont correctement importés.</p>
            </div>
            
            <div className="action-item">
              <strong>3. Vérifier la console :</strong>
              <p>Examiner la console du navigateur pour des erreurs JavaScript supplémentaires.</p>
            </div>
            
            <div className="action-item">
              <strong>4. Redémarrer l'application :</strong>
              <p>Parfois, un redémarrage peut résoudre les problèmes de variables non définies.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageDebugger;
