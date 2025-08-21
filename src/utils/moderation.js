// =====================================================
// SYSTÈME DE MODÉRATION AUTOMATIQUE - MAXIMARKET
// =====================================================

class ModerationService {
  // Mots interdits et patterns de détection
  static forbiddenWords = [
    // Spam et arnaques
    'spam', 'arnaque', 'fake', 'faux', 'escroquerie', 'arnaqueur',
    'arnaqueuse', 'escroc', 'arnaqueur', 'arnaqueuse', 'arnaqueur',
    
    // Insultes et langage inapproprié
    'merde', 'putain', 'con', 'salope', 'nique', 'fuck', 'shit',
    'bitch', 'asshole', 'connard', 'connasse', 'enculé', 'enculée',
    
    // Contenu commercial non autorisé
    'publicité', 'pub', 'promotion', 'offre spéciale', 'promo',
    'rabais', 'réduction', 'bon plan', 'opportunité', 'business',
    
    // Contenu politique ou religieux
    'politique', 'religion', 'dieu', 'allah', 'jésus', 'parti',
    'élection', 'vote', 'candidat', 'président', 'ministre',
    
    // Contenu illégal
    'drogue', 'cannabis', 'cocaïne', 'héroïne', 'trafic', 'illégal',
    'contrefaçon', 'faux billets', 'fausse monnaie', 'vol', 'cambriolage'
  ];

  // Patterns de détection de spam
  static spamPatterns = [
    /(https?:\/\/[^\s]+)/g, // URLs
    /(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)/g, // Emails
    /(\b\d{10,}\b)/g, // Numéros de téléphone longs
    /(\b[A-Z]{5,}\b)/g, // Texte en majuscules
    /(.)\1{4,}/g, // Caractères répétés
    /(\b\w+\b)(?:\s+\1){2,}/g // Mots répétés
  ];

  // Patterns de détection de contenu commercial
  static commercialPatterns = [
    /\b(achetez|vendez|promotion|offre|rabais|réduction|bon plan)\b/gi,
    /\b(contactez|appelez|écrivez|visitez)\b/gi,
    /\b(prix|tarif|coût|gratuit|payant)\b/gi
  ];

  /**
   * Analyser le contenu d'un commentaire
   */
  static analyzeContent(content) {
    if (!content || typeof content !== 'string') {
      return {
        isClean: false,
        score: 100,
        issues: ['Contenu vide ou invalide'],
        shouldAutoReject: true,
        shouldAutoApprove: false,
        moderationLevel: 'high'
      };
    }

    const lowerContent = content.toLowerCase();
    const issues = [];
    let score = 100; // Score de 0 à 100 (100 = très propre)

    // 1. Détection des mots interdits
    const foundForbiddenWords = this.forbiddenWords.filter(word => 
      lowerContent.includes(word.toLowerCase())
    );

    if (foundForbiddenWords.length > 0) {
      issues.push(`Mots interdits détectés: ${foundForbiddenWords.join(', ')}`);
      score -= foundForbiddenWords.length * 20; // -20 points par mot interdit
    }

    // 2. Détection de spam
    const spamDetected = this.spamPatterns.some(pattern => 
      pattern.test(content)
    );

    if (spamDetected) {
      issues.push('Patterns de spam détectés');
      score -= 30;
    }

    // 3. Détection de contenu commercial
    const commercialDetected = this.commercialPatterns.some(pattern => 
      pattern.test(content)
    );

    if (commercialDetected) {
      issues.push('Contenu commercial détecté');
      score -= 15;
    }

    // 4. Vérification de la longueur
    if (content.length < 10) {
      issues.push('Commentaire trop court');
      score -= 25;
    }

    if (content.length > 1000) {
      issues.push('Commentaire trop long');
      score -= 10;
    }

    // 5. Vérification des caractères spéciaux excessifs
    const specialCharRatio = (content.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length / content.length;
    if (specialCharRatio > 0.3) {
      issues.push('Trop de caractères spéciaux');
      score -= 20;
    }

    // 6. Vérification des majuscules excessives
    const upperCaseRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (upperCaseRatio > 0.5) {
      issues.push('Trop de majuscules');
      score -= 15;
    }

    // Déterminer l'action de modération
    const shouldAutoReject = score < 30 || foundForbiddenWords.length >= 3;
    const shouldAutoApprove = score >= 80 && issues.length === 0;
    const moderationLevel = score < 30 ? 'high' : score < 60 ? 'medium' : 'low';

    return {
      isClean: score >= 60,
      score: Math.max(0, score),
      issues,
      shouldAutoReject,
      shouldAutoApprove,
      moderationLevel,
      foundForbiddenWords,
      spamDetected,
      commercialDetected
    };
  }

  /**
   * Modérer automatiquement un commentaire
   */
  static async moderateComment(commentData) {
    const analysis = this.analyzeContent(commentData.content);
    
    let status = 'pending';
    let reason = null;

    if (analysis.shouldAutoReject) {
      status = 'rejected';
      reason = `Contenu inapproprié détecté: ${analysis.issues.join(', ')}`;
    } else if (analysis.shouldAutoApprove) {
      status = 'approved';
      reason = 'Contenu approuvé automatiquement';
    } else {
      status = 'pending';
      reason = 'Nécessite une modération manuelle';
    }

    return {
      status,
      reason,
      analysis,
      moderatedAt: new Date().toISOString()
    };
  }

  /**
   * Vérifier si un utilisateur peut poster (rate limiting)
   */
  static async checkUserRateLimit(userId, listingId) {
    // Cette fonction devrait être implémentée avec une base de données
    // Pour l'instant, on retourne true (pas de limite)
    return {
      canPost: true,
      reason: null,
      nextAllowedTime: null
    };
  }

  /**
   * Analyser le comportement d'un utilisateur
   */
  static async analyzeUserBehavior(userId) {
    // Cette fonction devrait analyser l'historique de l'utilisateur
    // Pour l'instant, on retourne un comportement neutre
    return {
      trustScore: 50,
      warningCount: 0,
      isFlagged: false,
      lastViolation: null
    };
  }

  /**
   * Obtenir des suggestions de modération
   */
  static getModerationSuggestions(analysis) {
    const suggestions = [];

    if (analysis.foundForbiddenWords.length > 0) {
      suggestions.push({
        type: 'warning',
        message: 'Évitez les mots inappropriés',
        action: 'reject'
      });
    }

    if (analysis.spamDetected) {
      suggestions.push({
        type: 'warning',
        message: 'Contenu détecté comme spam',
        action: 'reject'
      });
    }

    if (analysis.commercialDetected) {
      suggestions.push({
        type: 'info',
        message: 'Contenu commercial détecté',
        action: 'review'
      });
    }

    if (analysis.score < 50) {
      suggestions.push({
        type: 'warning',
        message: 'Score de qualité faible',
        action: 'review'
      });
    }

    return suggestions;
  }

  /**
   * Formater un rapport de modération
   */
  static formatModerationReport(commentData, analysis, moderationResult) {
    return {
      commentId: commentData.id,
      userId: commentData.user_id,
      listingId: commentData.listing_id,
      content: commentData.content,
      analysis: {
        score: analysis.score,
        issues: analysis.issues,
        moderationLevel: analysis.moderationLevel
      },
      moderation: {
        status: moderationResult.status,
        reason: moderationResult.reason,
        moderatedAt: moderationResult.moderatedAt
      },
      suggestions: this.getModerationSuggestions(analysis)
    };
  }
}

export default ModerationService;
