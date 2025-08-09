import React, { useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Attend que loading soit false pour vérifier l'authentification
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
    // L'utilisateur est déjà connecté, on peut return null ou un spinner
    return null;
  }

  // Sinon, afficher le formulaire
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <LoginForm />
    </motion.div>
  );
};

export default LoginPage;
