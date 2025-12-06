
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText } from 'lucide-react';
import { personalData } from '@/lib/personalData';

const PrivacyPolicyPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <ShieldCheck className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Politique de <span className="gradient-text">Confidentialité</span>
        </h1>
        <p className="text-lg text-muted-foreground">Dernière mise à jour : 06 Décembre 2025</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
          <p className="text-lg mb-6">
            Bienvenue sur {personalData.siteName}. Nous nous engageons à protéger la confidentialité de vos informations personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous visitez notre site web et utilisez nos services.
          </p>
        </div>

        <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
          <h2 className="flex items-center text-2xl font-bold mb-4">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            1. Informations que nous collectons
          </h2>
          <p className="mb-4">Nous pouvons collecter des informations personnelles vous concernant de différentes manières, notamment :</p>
          <ul className="space-y-2 text-muted-foreground">
            <li><strong>Informations fournies directement par vous :</strong> Lorsque vous créez un compte, publiez une annonce, effectuez une transaction, communiquez avec nous ou d'autres utilisateurs (nom, adresse e-mail, numéro de téléphone, informations de paiement, etc.).</li>
            <li><strong>Informations collectées automatiquement :</strong> Lorsque vous utilisez notre site, nous pouvons collecter des informations sur votre appareil, votre activité de navigation, votre adresse IP, votre localisation (si autorisée), les cookies et autres technologies de suivi.</li>
            <li><strong>Informations provenant de tiers :</strong> Nous pouvons recevoir des informations vous concernant de la part de services tiers, tels que les fournisseurs de services de paiement ou les plateformes de médias sociaux si vous choisissez de lier votre compte.</li>
          </ul>
        </div>

        <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
          <h2 className="flex items-center text-2xl font-bold mb-4">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            2. Utilisation de vos informations
          </h2>
          <p className="mb-4">Nous utilisons les informations que nous collectons pour :</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>Fournir, exploiter et améliorer nos services.</li>
            <li>Traiter vos transactions et gérer votre compte.</li>
            <li>Personnaliser votre expérience sur notre plateforme.</li>
            <li>Communiquer avec vous, y compris pour le service client et les mises à jour.</li>
            <li>Assurer la sécurité de notre plateforme et prévenir la fraude.</li>
            <li>Analyser l'utilisation de notre site et améliorer nos offres.</li>
            <li>Respecter nos obligations légales.</li>
          </ul>
        </div>

        <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
          <h2 className="flex items-center text-2xl font-bold mb-4">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            3. Partage de vos informations
          </h2>
          <p className="mb-4">Nous pouvons partager vos informations personnelles dans les circonstances suivantes :</p>
          <ul className="space-y-2 text-muted-foreground">
            <li><strong>Avec d'autres utilisateurs :</strong> Pour faciliter les transactions et les communications (par exemple, partager votre nom d'utilisateur ou les informations de contact nécessaires pour une transaction).</li>
            <li><strong>Avec des fournisseurs de services tiers :</strong> Qui nous aident à exploiter notre plateforme (hébergement, traitement des paiements, analyse de données, marketing, etc.). Ces fournisseurs sont contractuellement tenus de protéger vos informations.</li>
            <li><strong>Pour des raisons légales :</strong> Si la loi l'exige, ou pour répondre à une procédure légale valide, protéger nos droits, notre propriété ou notre sécurité, ou ceux de nos utilisateurs ou du public.</li>
            <li><strong>En cas de transfert d'entreprise :</strong> En cas de fusion, acquisition, réorganisation ou vente d'actifs, vos informations peuvent être transférées.</li>
          </ul>
        </div>

        <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
          <h2 className="flex items-center text-2xl font-bold mb-4">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            4. Vos droits et choix
          </h2>
          <p className="mb-4">Selon votre juridiction, vous pouvez avoir certains droits concernant vos informations personnelles, tels que :</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>Le droit d'accéder à vos informations.</li>
            <li>Le droit de corriger ou de mettre à jour vos informations.</li>
            <li>Le droit de supprimer vos informations.</li>
            <li>Le droit de vous opposer ou de restreindre certains traitements.</li>
            <li>Le droit à la portabilité des données.</li>
          </ul>
          <p className="mt-4 text-muted-foreground">Vous pouvez généralement gérer les informations de votre compte et vos préférences de communication via les paramètres de votre compte. Pour exercer d'autres droits, veuillez nous contacter.</p>
        </div>

        <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
          <h2 className="flex items-center text-2xl font-bold mb-4">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            5. Cookies et Technologies de Suivi
          </h2>
          <p className="mb-4">Nous utilisons des cookies et des technologies similaires pour :</p>
          <ul className="space-y-2 text-muted-foreground mb-4">
            <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site (authentification, préférences).</li>
            <li><strong>Cookies analytiques :</strong> Pour comprendre comment les visiteurs utilisent notre site et améliorer nos services.</li>
            <li><strong>Cookies publicitaires :</strong> Pour afficher des publicités pertinentes et mesurer leur efficacité.</li>
          </ul>
          <p className="text-muted-foreground">
            Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur. Notez que la désactivation de certains cookies peut affecter votre expérience sur notre site.
          </p>
        </div>

        <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
          <h2 className="flex items-center text-2xl font-bold mb-4">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            6. Publicité et Partenaires Tiers
          </h2>
          <p className="mb-4">Notre site utilise des services publicitaires tiers, notamment Google AdSense, pour afficher des publicités. Ces partenaires peuvent :</p>
          <ul className="space-y-2 text-muted-foreground mb-4">
            <li>Utiliser des cookies pour diffuser des annonces basées sur vos visites précédentes sur notre site ou d'autres sites.</li>
            <li>Collecter des informations anonymes sur vos visites pour personnaliser les publicités.</li>
            <li>Utiliser la technologie de remarketing pour vous montrer des annonces pertinentes.</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            Google utilise des cookies publicitaires pour permettre à ses partenaires de diffuser des annonces basées sur votre historique de navigation. Vous pouvez désactiver la publicité personnalisée en visitant les <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Paramètres des annonces Google</a>.
          </p>
          <p className="text-muted-foreground">
            Pour plus d'informations sur la façon dont Google utilise les données, consultez la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Politique de confidentialité de Google</a>.
          </p>
        </div>

        <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
          <h2 className="flex items-center text-2xl font-bold mb-4">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            7. Sécurité des données
          </h2>
          <p className="text-muted-foreground">
            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles raisonnables pour protéger vos informations personnelles contre l'accès non autorisé, la divulgation, l'altération ou la destruction. Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est totalement sécurisée.
          </p>
        </div>
        
        <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
          <h2 className="flex items-center text-2xl font-bold mb-4">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            8. Conservation des données
          </h2>
          <p className="text-muted-foreground">
            Nous conservons vos informations personnelles aussi longtemps que nécessaire pour atteindre les objectifs décrits dans cette politique de confidentialité, sauf si une période de conservation plus longue est requise ou autorisée par la loi.
          </p>
        </div>

        <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
          <h2 className="flex items-center text-2xl font-bold mb-4">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            9. Transferts internationaux
          </h2>
          <p className="text-muted-foreground">
            Vos informations peuvent être transférées et traitées dans des pays autres que votre pays de résidence, où les lois sur la protection des données peuvent différer. Nous prendrons des mesures appropriées pour garantir que vos informations personnelles restent protégées conformément à cette politique.
          </p>
        </div>

        <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
          <h2 className="flex items-center text-2xl font-bold mb-4">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            10. Modifications de cette politique
          </h2>
          <p className="text-muted-foreground">
            Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons de tout changement important en publiant la nouvelle politique sur notre site et en mettant à jour la date de "Dernière mise à jour".
          </p>
        </div>

        <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
          <h2 className="flex items-center text-2xl font-bold mb-4">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            11. Nous contacter
          </h2>
          <p className="text-muted-foreground">
            Si vous avez des questions ou des préoccupations concernant cette politique de confidentialité ou nos pratiques en matière de données, veuillez nous contacter à <a href={`mailto:${personalData.infoEmail}`} className="text-primary hover:underline">{personalData.infoEmail}</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicyPage;
