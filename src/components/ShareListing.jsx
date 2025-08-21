import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Facebook, Instagram, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const ShareListing = ({ listing, variant = "default" }) => {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  
  // Construire l'URL de partage
  const shareUrl = `${window.location.origin}/annonce/${listing.id}`;
  
  // Texte de partage optimisé
  const getShareText = (platform) => {
    const baseText = `🏠 Découvrez cette annonce sur MaxiMarket : ${listing.title}`;
    
    switch (platform) {
      case 'facebook':
        return `${baseText}\n\n💰 Prix : ${listing.price ? new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'XOF'
        }).format(listing.price) : 'Prix sur demande'}\n\n📍 ${listing.location?.city || 'Localisation non spécifiée'}`;
      
      case 'instagram':
        return `${baseText}\n\n💰 ${listing.price ? new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'XOF'
        }).format(listing.price) : 'Prix sur demande'}\n📍 ${listing.location?.city || 'Localisation non spécifiée'}\n\n#MaxiMarket #Marketplace #Afrique`;
      
      case 'tiktok':
        return `${baseText}\n💰 ${listing.price ? new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'XOF'
        }).format(listing.price) : 'Prix sur demande'}\n📍 ${listing.location?.city || 'Localisation non spécifiée'}\n\n#MaxiMarket #Marketplace #Afrique #FYP`;
      
      case 'whatsapp':
        return `${baseText}\n\n💰 Prix : ${listing.price ? new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'XOF'
        }).format(listing.price) : 'Prix sur demande'}\n📍 ${listing.location?.city || 'Localisation non spécifiée'}\n\n${shareUrl}`;
      
      default:
        return baseText;
    }
  };

  // Partager sur Facebook
  const shareToFacebook = () => {
    setIsSharing(true);
    
    const text = getShareText('facebook');
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`;
    
    window.open(url, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');
    
    setTimeout(() => setIsSharing(false), 1000);
    
    toast({
      title: "Partagé sur Facebook",
      description: "L'annonce a été partagée sur Facebook",
    });
  };

  // Partager sur Instagram (via lien direct)
  const shareToInstagram = () => {
    setIsSharing(true);
    
    // Instagram ne supporte pas le partage direct via URL
    // On copie le lien et on guide l'utilisateur
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Lien copié !",
        description: "Le lien a été copié. Ouvrez Instagram et collez-le dans votre story ou post.",
      });
      
      // Ouvrir Instagram dans un nouvel onglet
      window.open('https://www.instagram.com', '_blank');
    }).catch(() => {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien automatiquement.",
        variant: "destructive",
      });
    });
    
    setTimeout(() => setIsSharing(false), 1000);
  };

  // Partager sur TikTok (via lien direct)
  const shareToTikTok = () => {
    setIsSharing(true);
    
    // TikTok ne supporte pas le partage direct via URL
    // On copie le lien et on guide l'utilisateur
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Lien copié !",
        description: "Le lien a été copié. Ouvrez TikTok et collez-le dans votre vidéo ou description.",
      });
      
      // Ouvrir TikTok dans un nouvel onglet
      window.open('https://www.tiktok.com', '_blank');
    }).catch(() => {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien automatiquement.",
        variant: "destructive",
      });
    });
    
    setTimeout(() => setIsSharing(false), 1000);
  };

  // Partager sur WhatsApp
  const shareToWhatsApp = () => {
    setIsSharing(true);
    
    const text = getShareText('whatsapp');
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    window.open(url, '_blank');
    
    setTimeout(() => setIsSharing(false), 1000);
    
    toast({
      title: "Partagé sur WhatsApp",
      description: "L'annonce a été partagée sur WhatsApp",
    });
  };

  // Copier le lien
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Lien copié !",
        description: "Le lien de l'annonce a été copié dans le presse-papiers.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien.",
        variant: "destructive",
      });
    }
  };

  // Ouvrir l'annonce dans un nouvel onglet
  const openInNewTab = () => {
    window.open(shareUrl, '_blank');
  };

  // Version compacte (bouton dropdown)
  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={isSharing}
            className="flex items-center space-x-2"
          >
            <Share2 className="h-4 w-4" />
            <span>Partager</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={shareToFacebook}>
            <Facebook className="h-4 w-4 mr-2 text-blue-600" />
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareToInstagram}>
            <Instagram className="h-4 w-4 mr-2 text-pink-600" />
            Instagram
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareToTikTok}>
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
            TikTok
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareToWhatsApp}>
            <svg className="h-4 w-4 mr-2 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copier le lien
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openInNewTab}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Ouvrir l'annonce
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Version complète (boutons séparés)
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Share2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Partager cette annonce</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={shareToFacebook}
          disabled={isSharing}
          className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
        >
          <Facebook className="h-4 w-4 text-blue-600" />
          <span>Facebook</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={shareToInstagram}
          disabled={isSharing}
          className="flex items-center space-x-2 bg-pink-50 hover:bg-pink-100 border-pink-200"
        >
          <Instagram className="h-4 w-4 text-pink-600" />
          <span>Instagram</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={shareToTikTok}
          disabled={isSharing}
          className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white border-gray-700"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
          <span>TikTok</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={shareToWhatsApp}
          disabled={isSharing}
          className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 border-green-200"
        >
          <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          <span>WhatsApp</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={copyToClipboard}
          className="flex items-center space-x-2"
        >
          <Copy className="h-4 w-4" />
          <span>Copier le lien</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={openInNewTab}
          className="flex items-center space-x-2"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Ouvrir l'annonce</span>
        </Button>
      </div>
      
      {/* Informations sur le partage */}
      <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
        <p className="font-medium mb-1">💡 Conseils de partage :</p>
        <ul className="space-y-1">
          <li>• <strong>Facebook</strong> : Partage direct avec texte et lien</li>
          <li>• <strong>Instagram</strong> : Copiez le lien et collez-le dans votre story/post</li>
          <li>• <strong>TikTok</strong> : Ajoutez le lien dans la description de votre vidéo</li>
          <li>• <strong>WhatsApp</strong> : Partage direct avec texte et lien</li>
        </ul>
      </div>
    </div>
  );
};

export default ShareListing;
