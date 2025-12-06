
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAppMode } from '@/hooks/useAppMode';
import MobilePageLayout from '@/layouts/MobilePageLayout';

const ForgotPasswordPage = () => {
  const { toast } = useToast();
  const { isAppMode } = useAppMode();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      // Ici, vous appellerez votre API pour initier la reinitialisation du mot de passe
      // await forgotPassword(data.email);
      
      toast({
        title: "Email envoyé",
        description: "Si un compte existe avec cet email, vous recevrez les instructions de réinitialisation.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const pageContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen flex items-center justify-center ${isAppMode ? 'py-4 px-4' : 'py-12 px-4 sm:px-6 lg:px-8'}`}
    >
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Mot de passe oublié</CardTitle>
            <CardDescription>
              Entrez votre adresse email pour recevoir les instructions de réinitialisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    className="pl-10"
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

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer les instructions'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Retour à la{' '}
              <Link to="/connexion" className="text-primary hover:underline">
                page de connexion
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  );

  if (isAppMode) {
    return (
      <MobilePageLayout title="Mot de passe oublié" showBack>
        {pageContent}
      </MobilePageLayout>
    );
  }

  return pageContent;
};

export default ForgotPasswordPage;
