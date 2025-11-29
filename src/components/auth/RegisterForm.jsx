import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Mail, Lock, Phone, Loader2, CheckCircle2, RefreshCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const RegisterForm = () => {
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const [confirmation, setConfirmation] = useState({ shown: false, email: '' });
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);

  const onSubmit = async (data) => {
    const result = await registerUser(data);
    if (result && result.needsConfirmation) {
      setConfirmation({ shown: true, email: data.email });
    }
  };

  const password = watch('password');

  if (confirmation.shown) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto p-4"
      >
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/50"
            >
              <CheckCircle2 className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-white">Inscription réussie</CardTitle>
            <CardDescription className="text-gray-300">
              Vérifiez votre email pour confirmer votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-300 bg-white/5 p-4 rounded-lg border border-white/10">
              Nous avons envoyé un lien de confirmation à:
              <div className="mt-2 font-medium text-white text-base">{confirmation.email}</div>
            </div>

            {resendMessage && (
              <div className="text-sm text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                {resendMessage}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                type="button"
                onClick={async () => {
                  try {
                    setIsResending(true);
                    setResendMessage(null);
                    const { error } = await supabase.auth.resend({
                      type: 'signup',
                      email: confirmation.email,
                      options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`
                      }
                    });
                    if (error) throw error;
                    setResendMessage('Un nouvel email de confirmation a été envoyé.');
                  } catch (e) {
                    setResendMessage(e.message || "Impossible d'envoyer l'email de confirmation.");
                  } finally {
                    setIsResending(false);
                  }
                }}
                disabled={isResending}
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/50"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Renvoyer l'email
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmation({ shown: false, email: '' })}
                className="w-full sm:w-auto bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                Utiliser une autre adresse
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2 border-t border-white/10 pt-6">
            <p className="text-sm text-gray-300">
              Déjà confirmé ?
            </p>
            <Link to="/connexion" className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors">
              Se connecter
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto p-4"
    >
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50"
          >
            <User className="h-8 w-8 text-white" />
          </motion.div>
          <CardTitle className="text-2xl font-bold text-white">Inscription</CardTitle>
          <CardDescription className="text-gray-300">Créez votre compte MaxiMarket</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white font-medium">Prénom</Label>
              <div className="relative group">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  className="pl-11 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-blue-400/50 transition-all"
                  {...register('firstName', {
                    required: 'Le prénom est requis',
                    minLength: {
                      value: 2,
                      message: 'Le prénom doit contenir au moins 2 caractères'
                    }
                  })}
                />
              </div>
              {errors.firstName && (
                <p className="text-sm text-red-400">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white font-medium">Nom</Label>
              <div className="relative group">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  className="pl-11 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-blue-400/50 transition-all"
                  {...register('lastName', {
                    required: 'Le nom est requis',
                    minLength: {
                      value: 2,
                      message: 'Le nom doit contenir au moins 2 caractères'
                    }
                  })}
                />
              </div>
              {errors.lastName && (
                <p className="text-sm text-red-400">{errors.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  className="pl-11 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-blue-400/50 transition-all"
                  {...register('email', {
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-white font-medium">Téléphone</Label>
              <div className="relative group">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+221 77 123 45 67"
                  className="pl-11 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-blue-400/50 transition-all"
                  {...register('phoneNumber', {
                    required: 'Le numéro de téléphone est requis',
                    pattern: {
                      value: /^\+?[1-9]\d{1,14}$/,
                      message: 'Numéro de téléphone invalide'
                    }
                  })}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-red-400">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">Mot de passe</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-blue-400/50 transition-all"
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                    minLength: {
                      value: 8,
                      message: 'Le mot de passe doit contenir au moins 8 caractères'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
                    }
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white font-medium">Confirmer le mot de passe</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-blue-400/50 transition-all"
                  {...register('confirmPassword', {
                    required: 'Veuillez confirmer votre mot de passe',
                    validate: value =>
                      value === password || 'Les mots de passe ne correspondent pas'
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-blue-500/50 transition-all mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                'S\'inscrire'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="border-t border-white/10 pt-6">
          <p className="text-sm text-gray-300">
            Déjà un compte ?{' '}
            <Link to="/connexion" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RegisterForm;
