import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';
import { personalData } from '@/lib/personalData';

const SocialLinks = () => {
  const socialNetworks = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      url: personalData.socials.facebook,
      color: 'hover:bg-blue-600 hover:text-white',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      url: personalData.socials.instagram,
      color: 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 hover:text-white',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: () => (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
      url: personalData.socials.tiktok,
      color: 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
      bgColor: 'bg-gray-50 dark:bg-gray-900'
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: Twitter,
      url: personalData.socials.twitter,
      color: 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
      bgColor: 'bg-gray-50 dark:bg-gray-900'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      url: personalData.socials.whatsapp,
      color: 'hover:bg-green-600 hover:text-white',
      bgColor: 'bg-green-50 dark:bg-green-950'
    }
  ].filter(network => network.url);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🌐</span>
          <span>Suivez-nous</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {socialNetworks.map((network) => {
            const IconComponent = network.icon;
            return (
              <Button
                key={network.id}
                variant="outline"
                className={`h-auto py-4 flex flex-col items-center gap-2 transition-all duration-200 ${network.bgColor} ${network.color}`}
                asChild
              >
                <a
                  href={network.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <IconComponent className="h-6 w-6" />
                  <span className="text-xs font-medium">{network.name}</span>
                </a>
              </Button>
            );
          })}
        </div>
        
        <p className="text-xs text-center text-muted-foreground mt-4">
          Restez connecté avec nous sur les réseaux sociaux
        </p>
      </CardContent>
    </Card>
  );
};

export default SocialLinks;
