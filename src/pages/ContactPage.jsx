
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import { personalData } from '@/lib/personalData';
import { useAppMode } from '@/hooks/useAppMode';
import MobilePageLayout from '@/layouts/MobilePageLayout';

const ContactPage = () => {
  const { isAppMode } = useAppMode();

  const contactInfo = [
    { icon: <Mail className="h-6 w-6" />, label: "Email", value: personalData.contactEmail, href: `mailto:${personalData.contactEmail}` },
    { icon: <Phone className="h-6 w-6" />, label: "Téléphone", value: personalData.phone, href: `tel:${personalData.phone}` },
    { icon: <MapPin className="h-6 w-6" />, label: "Adresse", value: personalData.address, href: `https://maps.google.com/?q=${encodeURIComponent(personalData.address)}` },
  ];
  
  const socialLinks = [
    { icon: <Facebook className="h-6 w-6" />, label: "Facebook", href: personalData.socials.facebook },
    { icon: <Instagram className="h-6 w-6" />, label: "Instagram", href: personalData.socials.instagram },
    { icon: <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>, label: "TikTok", href: personalData.socials.tiktok },
  ];

  const pageContent = (
    <div className={`container mx-auto px-4 ${isAppMode ? 'py-8 pb-24' : 'py-12'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">
          Contactez <span className="gradient-text">{personalData.name}</span>
        </h1>
        <p className="text-muted-foreground">
          Vous avez un projet en tête ou une question ? N'hésitez pas à nous contacter !
        </p>
      </motion.div>
      
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold mb-6">Informations de contact</h2>
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <motion.a
                    key={index}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-4 p-4 rounded-lg glass-effect hover:border-primary transition-colors"
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{item.label}</h3>
                      <p className="text-muted-foreground">{item.value}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-6">Réseaux sociaux</h2>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="p-4 rounded-full bg-secondary hover:bg-primary/20 transition-colors"
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
            

          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold mb-6">Envoyez un message</h2>
              <ContactForm />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );

  if (isAppMode) {
    return (
      <MobilePageLayout title="Contact" showBack>
        {pageContent}
      </MobilePageLayout>
    );
  }

  return pageContent;
};

export default ContactPage;
