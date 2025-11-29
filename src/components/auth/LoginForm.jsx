
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Lock, Loader2 } from 'lucide-react';


const LoginForm = () => {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [rememberMe, setRememberMe] = useState(false);


  const onSubmit = async (data) => {
    await login(data, rememberMe);
  };

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
            <Lock className="h-8 w-8 text-white" />
          </motion.div>
          <CardTitle className="text-2xl font-bold text-white">Connexion</CardTitle>
          <CardDescription className="text-gray-300">Connectez-vous à votre compte MaxiMarket</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">Adresse e-mail</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-blue-400/50 transition-all"
                  {...register('email', {
                    required: 'L\'adresse e-mail est requise',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Adresse e-mail invalide'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
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
                  className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-blue-400/50 transition-all"
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                    minLength: {
                      value: 8,
                      message: 'Le mot de passe doit contenir au moins 8 caractères'
                    }
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Option "Se souvenir de moi" */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
                className="border-white/20 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-normal cursor-pointer text-gray-300"
              >
                Se souvenir de moi
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-blue-500/50 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 border-t border-white/10 pt-6">
          <Link
            to="/mot-de-passe-oublie"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Mot de passe oublié ?
          </Link>
          <p className="text-sm text-gray-300">
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              S'inscrire
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default LoginForm;
