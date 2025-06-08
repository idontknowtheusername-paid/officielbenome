
import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <RegisterForm />
    </motion.div>
  );
};

export default RegisterPage;
