import React, { useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppMode } from '@/hooks/useAppMode';
import MobilePageLayout from '@/layouts/MobilePageLayout';

const LoginPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAppMode } = useAppMode();

  useEffect(() => {
    // Attend que loading soit false pour verifier l'authentification
    if (!loading && user) {
      // Rediriger vers la page d'origine ou le dashboard admin
      const from = location.state?.from || (user.role === 'admin' ? '/admin' : '/');
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    // Un petit spinner ou rien
    return null;
  }

  if (user) {
    // L'utilisateur est deja connecte, on peut return null ou un spinner
    return null;
  }

  // Sinon, afficher le formulaire
  const pageContent = (
    <div className={`min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center ${isAppMode ? 'py-4 px-4' : 'py-12 px-4 sm:px-6 lg:px-8'} relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative z-10 w-full"
      >
        <LoginForm />
      </motion.div>
    </div>
  );

  if (isAppMode) {
    return (
      <MobilePageLayout title="Connexion" showBack>
        {pageContent}
      </MobilePageLayout>
    );
  }

  return pageContent;
};

export default LoginPage;
