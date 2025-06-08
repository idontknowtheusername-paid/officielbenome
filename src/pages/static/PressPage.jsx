import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Award, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { personalData } from '@/lib/personalData';

const PressPage = () => {
  const pressReleases = [
    {
      id: 1,
      title: "Benome révolutionne le e-commerce en Afrique de l'Ouest",
      date: "01 Juin 2025",
      description: "Lancement officiel de la plateforme marketplace innovante Benome.",
      pdfUrl: "#",
    },
    {
      id: 2,
      title: "Partenariat stratégique avec PayDunya",
      date: "15 Mai 2025",
      description: "Benome s'associe à PayDunya pour faciliter les paiements en ligne.",
      pdfUrl: "#",
    },
  ];

  const mediaKit = {
    logos: [
      { name: "Logo Principal", format: "PNG, SVG", size: "2MB", url: "#" },
      { name: "Logo Monochrome", format: "PNG, SVG", size: "1.5MB", url: "#" },
    ],
    photos: [
      { name: "Photos de l'équipe", format: "JPG", size: "5MB", url: "#" },
      { name: "Interface utilisateur", format: "JPG", size: "3MB", url: "#" },
    ],
  };

  const pressContacts = {
    name: "Service Relations Presse",
    email: "presse@benome.com",
    phone: "+221 77 123 45 67",
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <Newspaper className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Espace <span className="gradient-text">Presse</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Retrouvez toutes les actualités, ressources et informations pour la presse concernant {personalData.siteName}.
        </p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <Award className="h-6 w-6 mr-2 text-primary" />
          Derniers Communiqués de Presse
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pressReleases.map((release) => (
            <Card key={release.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle>{release.title}</CardTitle>
                <CardDescription>{release.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">{release.description}</p>
                <Button variant="outline" className="w-full" asChild>
                  <a href={release.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" /> Télécharger le PDF
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold mb-8">Kit Média</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Logos</CardTitle>
              <CardDescription>Téléchargez nos logos officiels</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {mediaKit.logos.map((logo, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{logo.name}</p>
                      <p className="text-sm text-muted-foreground">{logo.format} • {logo.size}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={logo.url} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>Photos officielles haute résolution</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {mediaKit.photos.map((photo, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{photo.name}</p>
                      <p className="text-sm text-muted-foreground">{photo.format} • {photo.size}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={photo.url} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center bg-card p-8 rounded-xl shadow-lg border border-border"
      >
        <h2 className="text-2xl font-bold mb-6">Contact Presse</h2>
        <div className="max-w-md mx-auto">
          <p className="font-medium text-lg mb-2">{pressContacts.name}</p>
          <p className="text-muted-foreground mb-6">
            Pour toute demande d'interview ou d'information complémentaire
          </p>
          <div className="space-y-2">
            <Button variant="outline" className="w-full" asChild>
              <a href={`mailto:${pressContacts.email}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                {pressContacts.email}
              </a>
            </Button>
            <Button variant="outline" className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              {pressContacts.phone}
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default PressPage;