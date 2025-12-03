import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Mail, Lock, Phone, Loader2, CheckCircle2, RefreshCcw, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const RegisterForm = () => {
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const [confirmation, setConfirmation] = useState({ shown: false, email: '' });
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        <Card className="backdrop-blur-xl bg-card/80 border-border shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/50"
            >
              <CheckCircle2 className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-foreground">Inscription réussie</CardTitle>
            <CardDescription className="text-muted-foreground">
              Vérifiez votre email pour confirmer votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border border-border">
              Nous avons envoyé un lien de confirmation à:
              <div className="mt-2 font-medium text-foreground text-base">{confirmation.email}</div>
            </div>

            {resendMessage && (
              <div className="text-sm text-green-600 dark:text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
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
                className="w-full sm:w-auto"
              >
                Utiliser une autre adresse
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Déjà confirmé ?
            </p>
            <Link to="/connexion" className="text-primary hover:text-primary/80 text-sm font-semibold transition-colors">
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
      <Card className="backdrop-blur-xl bg-card/80 border-border shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/50"
          >
            <User className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <CardTitle className="text-2xl font-bold text-foreground">Inscription</CardTitle>
          <CardDescription className="text-muted-foreground">Créez votre compte MaxiMarket</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-foreground font-medium">Prénom</Label>
              <div className="relative group">
                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  className="pl-11 h-11 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all"
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
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-foreground font-medium">Nom</Label>
              <div className="relative group">
                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  className="pl-11 h-11 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all"
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
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  className="pl-11 h-11 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all"
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
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-foreground font-medium">Téléphone</Label>
              <div className="relative group">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+221 77 123 45 67"
                  className="pl-11 h-11 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all"
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
                <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">Mot de passe</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-11 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all"
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                    minLength: {
                      value: 8,
                      message: 'Minimum 8 caractères'
                    }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirmer le mot de passe</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-11 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all"
                  {...register('confirmPassword', {
                    required: 'Veuillez confirmer votre mot de passe',
                    validate: value =>
                      value === password || 'Les mots de passe ne correspondent pas'
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                  aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/50 transition-all mt-6"
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
        <CardFooter className="border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link to="/connexion" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RegisterForm;
