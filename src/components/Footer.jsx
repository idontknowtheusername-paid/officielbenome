
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Send, ArrowRight, Mail, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { personalData } from '@/lib/personalData';
import { newsletterService } from '@/services/newsletter.service';
import { useToast } from '@/components/ui/use-toast';
import { useAppMode } from '@/hooks/useAppMode';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Utiliser le hook pour détecter le mode app (native ou PWA)
  const { isAppMode } = useAppMode();

  const footerLinks = [
    {
      title: "Explorer",
      links: [
        { name: "Immobilier", path: "/immobilier" },
        { name: "Automobile", path: "/automobile" },
        { name: "Services Pro", path: "/services" },
        { name: "Marketplace", path: "/marketplace" },
      ],
    },
    {
      title: "Entreprise",
      links: [
        { name: "À Propos", path: "/a-propos" },
        { name: "Carrières", path: "/carrieres" },
        { name: "Presse", path: "/presse" },
        { name: "Blog", path: "/blog" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Centre d'Aide", path: "/aide" },
        { name: "Contactez-nous", path: "/contact" },
        { name: "FAQ", path: "/faq" },
        { name: "Politique de Confidentialité", path: "/politique-confidentialite" },
        { name: "Termes & Conditions", path: "/conditions-utilisation" },
      ],
    },
  ];

  const socialLinks = [
    { name: "Facebook", icon: <Facebook className="h-5 w-5" />, path: personalData.socials.facebook },
    { name: "Instagram", icon: <Instagram className="h-5 w-5" />, path: personalData.socials.instagram },
    { name: "TikTok", icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>, path: personalData.socials.tiktok },
    { name: "Twitter", icon: <Twitter className="h-5 w-5" />, path: personalData.socials.twitter },
    { name: "WhatsApp", icon: <MessageCircle className="h-5 w-5" />, path: personalData.socials.whatsapp },
  ].filter(social => social.path && social.path !== "");

  // Debug: Afficher les réseaux sociaux dans la console
  console.log("🔍 Réseaux sociaux disponibles:", personalData.socials);
  console.log("🔍 Réseaux sociaux filtrés:", socialLinks);

  // Gestionnaire pour l'inscription à la newsletter
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir votre adresse email",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await newsletterService.subscribe(email.trim());
      
      toast({
        title: "Inscription réussie !",
        description: result.message,
      });
      
      setEmail(''); // Vider le champ
      
    } catch (error) {
      console.error('Erreur inscription newsletter:', error);
      
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Masquer le footer sur app mobile (native ou PWA installée)
  if (isAppMode) {
    return null;
  }

  return (
    <footer className="bg-card text-card-foreground border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section principale - Desktop */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 pt-8 pb-6">
          {/* Logo & Newsletter */}
          <div className="md:col-span-2 lg:col-span-1 xl:col-span-2 pr-4">
            <Link to="/" className="flex items-center mb-4">
              <img
                src="/logo.png?v=2024"
                alt="MaxiMarket Logo"
                className="h-16 md:h-20 w-auto object-contain transition-all duration-300"
              />
            </Link>
            <p className="text-muted-foreground text-sm mb-4">
              La plateforme N°1 en Afrique de l'Ouest pour l'immobilier, l'automobile, les services et bien plus.
            </p>
            <p className="font-semibold mb-2 text-sm">Restez informé de nos nouveautés :</p>
            <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2">
              <Input 
                type="email" 
                placeholder="Votre adresse e-mail" 
                className="flex-grow"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>

          {/* Footer Links - Desktop */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <p className="font-semibold mb-3">{section.title}</p>
              <ul className="space-y-1">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center group"
                    >
                      {link.name}
                      <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Section mobile optimisée */}
        <div className="md:hidden">
          {/* Logo et description - Mobile */}
          <div className="pt-6 pb-4 text-center">
            <Link to="/" className="flex items-center justify-center mb-3">
              <img
                src="/logo.png"
                alt="MaxiMarket Logo"
                className="h-14 w-auto object-contain transition-all duration-300"
              />
            </Link>
            <p className="text-muted-foreground text-sm mb-3">
              La plateforme N°1 en Afrique de l'Ouest
            </p>
            
            {/* Newsletter mobile */}
            <div className="mb-4">
              <p className="font-semibold mb-2 text-sm">Newsletter :</p>
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2 max-w-xs mx-auto">
                <Input 
                  type="email" 
                  placeholder="Email" 
                  className="flex-grow text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Liens organisés horizontalement - Mobile */}
          <div className="pb-4">
            <div className="grid grid-cols-3 gap-4">
              {footerLinks.map((section) => (
                <div key={section.title} className="text-center">
                  <p className="font-semibold mb-2 text-sm text-primary">{section.title}</p>
                  <div className="space-y-1">
                    {section.links.slice(0, 3).map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        className="block text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Réseaux sociaux - Mobile (plus visible) */}
          <div className="pb-4">
            <p className="text-center font-semibold mb-3 text-sm text-primary">Suivez-nous</p>
            <div className="flex justify-center space-x-6">
              {socialLinks.length > 0 ? (
                socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    to={social.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-accent"
                  >
                    {social.icon}
                  </Link>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">Réseaux sociaux en cours de configuration</p>
              )}
            </div>
          </div>

          {/* Contact rapide - Mobile */}
          <div className="pb-4">
            <p className="text-center font-semibold mb-3 text-sm text-primary">Contact</p>
            <div className="flex justify-center space-x-6 text-xs text-muted-foreground">
              <Link to="/contact" className="flex items-center space-x-1 hover:text-primary">
                <Mail className="h-3 w-3" />
                <span>Contact</span>
              </Link>
              <Link to="/aide" className="flex items-center space-x-1 hover:text-primary">
                <Phone className="h-3 w-3" />
                <span>Aide</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Section copyright et réseaux sociaux - Desktop */}
        <div className="hidden md:block border-t border-border pt-6 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground mb-4 md:mb-0">
              &copy; {currentYear} {personalData.siteName}. Tous droits réservés.
            </p>
            <div className="flex space-x-4">
              {socialLinks.length > 0 ? (
                socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    to={social.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {social.icon}
                  </Link>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">Réseaux sociaux en cours de configuration</p>
              )}
            </div>
          </div>
        </div>

        {/* Copyright mobile */}
        <div className="md:hidden border-t border-border pt-4 pb-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} {personalData.siteName}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;