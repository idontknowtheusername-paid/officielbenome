import React, { useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Attend que loading soit false pour vérifier l'authentification
    if (!loading && user) {
      navigate('/admin-dashboard');
    }
  }, [user, loading, navigate]);

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
