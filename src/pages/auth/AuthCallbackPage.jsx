import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // detectSessionInUrl: true permet déjà à Supabase de traiter le hash
    // On attend simplement que la session soit prête puis on redirige
    const process = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          navigate('/', { replace: true });
        } else {
          // Si pas de session, rediriger vers la connexion
          navigate('/connexion', { replace: true });
        }
      } catch (e) {
        navigate('/connexion', { replace: true });
      }
    };
    process();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Traitement de la confirmation...
      </div>
    </div>
  );
};

export default AuthCallbackPage;

