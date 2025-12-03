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
      color: 'text-white hover:scale-105',
      bgColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      url: personalData.socials.instagram,
      color: 'text-white hover:scale-105',
      bgColor: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600'
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
      color: 'text-white hover:scale-105',
      bgColor: 'bg-black hover:bg-gray-900'
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: Twitter,
      url: personalData.socials.twitter,
      color: 'text-white hover:scale-105',
      bgColor: 'bg-black hover:bg-gray-900'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      url: personalData.socials.whatsapp,
      color: 'text-white hover:scale-105',
      bgColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: 'threads',
      name: 'Threads',
      icon: () => (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M12.186 3.998a8.188 8.188 0 1 0 0 16.376 8.188 8.188 0 0 0 0-16.376zm4.606 11.531c-.315.325-.766.527-1.314.588-.549.061-1.176-.016-1.801-.231a6.277 6.277 0 0 1-1.138-.527 7.716 7.716 0 0 1-.748-.495 3.694 3.694 0 0 1-.748-.748 2.456 2.456 0 0 1-.495-1.138c-.061-.549-.016-1.176.231-1.801.247-.625.588-1.138 1.014-1.514.426-.376.927-.625 1.476-.748.549-.123 1.138-.123 1.726 0 .588.123 1.138.376 1.601.748.463.372.825.825 1.076 1.352.251.527.376 1.138.376 1.801 0 .663-.125 1.274-.376 1.801-.251.527-.613.98-1.076 1.352-.463.372-1.013.625-1.601.748-.588.123-1.177.123-1.726 0-.549-.123-1.05-.372-1.476-.748-.426-.376-.767-.889-1.014-1.514-.247-.625-.292-1.252-.231-1.801.061-.549.263-1.05.588-1.476.325-.426.748-.748 1.252-.964.504-.216 1.076-.325 1.676-.325.6 0 1.172.109 1.676.325.504.216.927.538 1.252.964.325.426.527.927.588 1.476.061.549.016 1.176-.231 1.801z" />
        </svg>
      ),
      url: personalData.socials.threads,
      color: 'text-white hover:scale-105',
      bgColor: 'bg-black hover:bg-gray-900'
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
        <div className="grid grid-cols-3 gap-3">
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
