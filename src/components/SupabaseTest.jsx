import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function SupabaseTest() {
  const { user, loading, signIn, signUp, signOut, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [testResult, setTestResult] = useState(null)

  const handleSignIn = async (e) => {
    e.preventDefault()
    setMessage('')
    
    const { error } = await signIn(email, password)
    if (error) {
      setMessage(`Erreur de connexion: ${error.message}`)
    } else {
      setMessage('Connexion réussie !')
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setMessage('')
    
    const { error } = await signUp(email, password, {
      first_name: 'Test',
      last_name: 'User'
    })
    if (error) {
      setMessage(`Erreur d'inscription: ${error.message}`)
    } else {
      setMessage('Inscription réussie ! Vérifiez votre email.')
    }
  }

  const testConnection = async () => {
    try {
      setTestResult('Test en cours...')
      
      // Test de connexion a Supabase
      const { data, error } = await supabase.from('_test_connection').select('*').limit(1)
      
      if (error && error.code === 'PGRST116') {
        // Erreur attendue car la table n'existe pas encore
        setTestResult('✅ Connexion Supabase réussie ! (Table de test inexistante - normal)')
      } else if (error) {
        setTestResult(`❌ Erreur de connexion: ${error.message}`)
      } else {
        setTestResult('✅ Connexion Supabase réussie !')
      }
    } catch (error) {
      setTestResult(`❌ Erreur: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Chargement...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>🧪 Test Supabase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} className="w-full">
            Tester la Connexion Supabase
          </Button>
          
          {testResult && (
            <Alert>
              <AlertDescription>{testResult}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-600">
            <p><strong>URL Supabase:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Non configuré'}</p>
            <p><strong>Clé API:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurée' : '❌ Manquante'}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>🔐 Authentification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="text-sm">
                <p><strong>Connecté:</strong> {user?.email}</p>
                <p><strong>ID:</strong> {user?.id}</p>
              </div>
              <Button onClick={signOut} variant="destructive" className="w-full">
                Se Déconnecter
              </Button>
            </div>
          ) : (
            <form className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleSignIn} className="flex-1">
                  Se Connecter
                </Button>
                <Button onClick={handleSignUp} variant="outline" className="flex-1">
                  S'inscrire
                </Button>
              </div>
            </form>
          )}

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 