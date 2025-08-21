import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { commentService } from '@/services/comment.service';
import { supabase } from '@/lib/supabase';
import { 
  Bug, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Info
} from 'lucide-react';

const CommentsDebug = ({ listingId }) => {
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      listingId,
      tests: {}
    };

    try {
      // Test 1: Connexion Supabase
      console.log('🔍 Test 1: Connexion Supabase...');
      const { data: authData, error: authError } = await supabase.auth.getSession();
      diagnostics.tests.supabaseConnection = {
        success: !authError,
        error: authError?.message,
        session: !!authData?.session
      };

      // Test 2: Vérifier si les tables existent
      console.log('🔍 Test 2: Vérification des tables...');
      const { data: tablesData, error: tablesError } = await supabase
        .from('comments')
        .select('count')
        .limit(1);
      
      diagnostics.tests.tablesExist = {
        success: !tablesError,
        error: tablesError?.message,
        hasCommentsTable: !tablesError
      };

      // Test 3: Test de lecture des commentaires
      console.log('🔍 Test 3: Test de lecture des commentaires...');
      const { comments, error: commentsError } = await commentService.getComments(listingId, { limit: 1 });
      
      diagnostics.tests.commentsRead = {
        success: !commentsError,
        error: commentsError,
        commentsCount: comments?.length || 0
      };

      // Test 4: Test des statistiques
      console.log('🔍 Test 4: Test des statistiques...');
      const { stats, error: statsError } = await commentService.getCommentStats(listingId);
      
      diagnostics.tests.statsRead = {
        success: !statsError,
        error: statsError,
        stats: stats
      };

      // Test 5: Vérifier les RLS policies
      console.log('🔍 Test 5: Test des permissions...');
      const { data: rlsTest, error: rlsError } = await supabase
        .from('comments')
        .select('id')
        .eq('listing_id', listingId)
        .limit(1);
      
      diagnostics.tests.rlsPolicies = {
        success: !rlsError,
        error: rlsError?.message,
        canRead: !rlsError
      };

    } catch (err) {
      setError(err.message);
      diagnostics.error = err.message;
    }

    setDebugInfo(diagnostics);
    setLoading(false);
  };

  useEffect(() => {
    if (listingId) {
      runDiagnostics();
    }
  }, [listingId]);

  const getTestIcon = (test) => {
    if (!test) return <Info className="h-4 w-4 text-gray-400" />;
    if (test.success) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const getTestColor = (test) => {
    if (!test) return 'text-gray-500';
    if (test.success) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-800">
          <Bug className="h-5 w-5" />
          <span>Debug - Système de Commentaires</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informations de base */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Listing ID:</span> {listingId}
          </div>
          <div>
            <span className="font-medium">Timestamp:</span> {debugInfo.timestamp}
          </div>
        </div>

        {/* Tests */}
        <div className="space-y-3">
          <h4 className="font-medium text-orange-800">Tests de diagnostic :</h4>
          
          {Object.entries(debugInfo.tests || {}).map(([testName, test]) => (
            <div key={testName} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
              {getTestIcon(test)}
              <div className="flex-1">
                <div className={`font-medium ${getTestColor(test)}`}>
                  {testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
                {test?.error && (
                  <div className="text-xs text-red-600 mt-1">
                    Erreur: {test.error}
                  </div>
                )}
                {test?.success && (
                  <div className="text-xs text-green-600 mt-1">
                    ✅ Succès
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 pt-4 border-t border-orange-200">
          <Button
            onClick={runDiagnostics}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Relancer les tests
          </Button>

          <Button
            onClick={() => console.log('Debug Info:', debugInfo)}
            variant="outline"
            size="sm"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <Database className="h-4 w-4 mr-2" />
            Voir dans la console
          </Button>
        </div>

        {/* Erreur générale */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Erreur générale :</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Conseils de résolution */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-800 mb-2">
            <Info className="h-4 w-4" />
            <span className="font-medium">Conseils de résolution :</span>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Vérifiez que le script SQL a été exécuté dans Supabase</li>
            <li>• Vérifiez les variables d'environnement Supabase</li>
            <li>• Vérifiez les RLS policies dans Supabase</li>
            <li>• Vérifiez la console du navigateur pour plus de détails</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentsDebug;
