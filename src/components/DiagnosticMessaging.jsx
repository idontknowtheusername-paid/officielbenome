import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const DiagnosticMessaging = () => {
  const { user, session, loading } = useAuth();
  const [diagnostics, setDiagnostics] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results = {};

    try {
      // 1. Test de connexion Supabase
      console.log('🔍 Test de connexion Supabase...');
      const { data: healthCheck, error: healthError } = await supabase
        .from('conversations')
        .select('count')
        .limit(1);
      
      results.supabaseConnection = {
        status: healthError ? 'error' : 'success',
        message: healthError ? `Erreur: ${healthError.message}` : 'Connexion OK',
        details: healthError
      };

      // 2. Test d'authentification
      console.log('🔍 Test d\'authentification...');
      results.authentication = {
        status: user ? 'success' : 'error',
        message: user ? `Utilisateur connecté: ${user.email}` : 'Aucun utilisateur connecté',
        details: { user, session }
      };

      // 3. Test des variables d'environnement
      console.log('🔍 Test des variables d\'environnement...');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      results.environment = {
        status: (supabaseUrl && supabaseKey) ? 'success' : 'error',
        message: (supabaseUrl && supabaseKey) ? 'Variables configurées' : 'Variables manquantes',
        details: {
          url: supabaseUrl ? '✅ Configurée' : '❌ Manquante',
          key: supabaseKey ? '✅ Configurée' : '❌ Manquante'
        }
      };

      // 4. Test de récupération des conversations
      if (user) {
        console.log('🔍 Test de récupération des conversations...');
        try {
          const { data: conversations, error: conversationsError } = await supabase
            .from('conversations')
            .select('*')
            .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
            .limit(5);
          
          results.conversations = {
            status: conversationsError ? 'error' : 'success',
            message: conversationsError ? `Erreur: ${conversationsError.message}` : `${conversations?.length || 0} conversations trouvées`,
            details: conversationsError
          };
        } catch (error) {
          results.conversations = {
            status: 'error',
            message: `Erreur: ${error.message}`,
            details: error
          };
        }
      }

      // 5. Test de récupération des messages
      if (user) {
        console.log('🔍 Test de récupération des messages...');
        try {
          const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .limit(5);
          
          results.messages = {
            status: messagesError ? 'error' : 'success',
            message: messagesError ? `Erreur: ${messagesError.message}` : `${messages?.length || 0} messages trouvés`,
            details: messagesError
          };
        } catch (error) {
          results.messages = {
            status: 'error',
            message: `Erreur: ${error.message}`,
            details: error
          };
        }
      }

    } catch (error) {
      console.error('❌ Erreur lors du diagnostic:', error);
      results.general = {
        status: 'error',
        message: `Erreur générale: ${error.message}`,
        details: error
      };
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success': return <Badge variant="default" className="bg-green-500">OK</Badge>;
      case 'error': return <Badge variant="destructive">ERREUR</Badge>;
      default: return <Badge variant="secondary">WARNING</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Diagnostic Interface Messagerie
          </CardTitle>
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="w-fit"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Diagnostic en cours...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Relancer le diagnostic
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(diagnostics).map(([key, result]) => (
            <div key={key} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  {getStatusBadge(result.status)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
              {result.details && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground">
                    Détails techniques
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiagnosticMessaging;