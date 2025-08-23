// ============================================================================
// SERVICE TEMPLATES D'EMAILS - MAXIMARKET
// ============================================================================

export const emailTemplates = {
    // ============================================================================
    // TEMPLATES DE BIENVENUE ET INSCRIPTION
    // ============================================================================
  
    // Email de bienvenue pour nouvelle inscription newsletter
    welcomeNewsletter: (email, firstName = '') => ({
      subject: '🎉 Bienvenue sur MaxiMarket !',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenue sur MaxiMarket</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 2.5em; font-weight: 700; }
            .header p { margin: 10px 0 0 0; font-size: 1.2em; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .welcome-text { font-size: 1.1em; margin-bottom: 30px; }
            .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .feature { background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea; }
            .feature h3 { margin: 0 0 10px 0; color: #667eea; }
            .feature p { margin: 0; font-size: 0.9em; }
            .cta-buttons { text-align: center; margin: 40px 0; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 10px; font-weight: 600; transition: all 0.3s ease; }
            .btn:hover { background: #5a6fd8; transform: translateY(-2px); }
            .btn-secondary { background: #6c757d; }
            .btn-secondary:hover { background: #5a6268; }
            .tips { background: #e3f2fd; padding: 25px; border-radius: 10px; margin: 30px 0; }
            .tips h3 { color: #1976d2; margin-top: 0; }
            .tips ul { margin: 10px 0; padding-left: 20px; }
            .tips li { margin: 8px 0; }
            .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 0.9em; }
            .footer a { color: #667eea; text-decoration: none; }
            .social-links { margin: 20px 0; }
            .social-links a { display: inline-block; margin: 0 10px; color: #667eea; text-decoration: none; }
            @media (max-width: 600px) {
              .features-grid { grid-template-columns: 1fr; }
              .header h1 { font-size: 2em; }
              .content { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bienvenue sur MaxiMarket !</h1>
              <p>Votre marketplace de confiance pour l'Afrique de l'Ouest</p>
            </div>
            
            <div class="content">
              <div class="welcome-text">
                <h2>Bonjour ${firstName || 'Cher utilisateur'} !</h2>
                <p>Merci de vous être inscrit à notre newsletter ! Vous recevrez désormais nos dernières actualités, offres spéciales et conseils pour optimiser votre expérience sur MaxiMarket.</p>
              </div>
              
              <h3>🚀 Découvrez nos fonctionnalités :</h3>
              <div class="features-grid">
                <div class="feature">
                  <h3>🏠 Immobilier</h3>
                  <p>Achetez, vendez ou louez des biens immobiliers en toute sécurité avec nos partenaires vérifiés.</p>
                </div>
                <div class="feature">
                  <h3>🚗 Automobile</h3>
                  <p>Trouvez votre véhicule idéal parmi des milliers d'annonces de particuliers et professionnels.</p>
                </div>
                <div class="feature">
                  <h3>🛠️ Services</h3>
                  <p>Connectez-vous avec des professionnels qualifiés pour tous vos besoins de services.</p>
                </div>
                <div class="feature">
                  <h3>🛍️ Marketplace</h3>
                  <p>Tout ce dont vous avez besoin en un seul endroit, avec des prix compétitifs.</p>
                </div>
              </div>
              
              <div class="cta-buttons">
                <a href="${window.location.origin}/marketplace" class="btn">Explorer MaxiMarket</a>
                <a href="${window.location.origin}/creer-annonce" class="btn btn-secondary">Créer une annonce</a>
              </div>
              
              <div class="tips">
                <h3>💡 Conseils pour bien commencer :</h3>
                <ul>
                  <li><strong>Complétez votre profil</strong> pour plus de visibilité et de confiance</li>
                  <li><strong>Ajoutez des photos de qualité</strong> à vos annonces pour attirer plus d'acheteurs</li>
                  <li><strong>Répondez rapidement</strong> aux messages pour augmenter vos chances de vente</li>
                  <li><strong>Utilisez des mots-clés pertinents</strong> dans vos descriptions</li>
                  <li><strong>Fixez des prix compétitifs</strong> en consultant les prix du marché</li>
                </ul>
              </div>
              
              <p><strong>Besoin d'aide ?</strong> Notre équipe support est disponible 24/7 pour vous accompagner dans votre parcours sur MaxiMarket.</p>
              
              <div class="social-links">
                <p>Suivez-nous sur les réseaux sociaux :</p>
                <a href="https://facebook.com/maximarket">Facebook</a> |
                <a href="https://twitter.com/maximarket">Twitter</a> |
                <a href="https://instagram.com/maximarket">Instagram</a>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2024 MaxiMarket. Tous droits réservés.</p>
              <p>Vous recevez cet email car vous vous êtes inscrit à notre newsletter.</p>
              <p><a href="${window.location.origin}/newsletter/unsubscribe?email=${email}">Se désinscrire</a> | <a href="${window.location.origin}/contact">Contact</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
  
    // Email de réactivation pour réinscription
    reactivationNewsletter: (email) => ({
      subject: '🔄 Bienvenue de retour sur MaxiMarket !',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Réactivation MaxiMarket</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 2.5em; font-weight: 700; }
            .content { padding: 40px 30px; text-align: center; }
            .welcome-back { font-size: 1.3em; margin-bottom: 30px; }
            .cta-button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔄 Bienvenue de retour !</h1>
            </div>
            <div class="content">
              <div class="welcome-back">
                <h2>Votre inscription a été réactivée</h2>
                <p>Nous sommes ravis de vous revoir ! Vous recevrez à nouveau nos newsletters et actualités.</p>
                <p>Découvrez ce qui a changé depuis votre dernière visite :</p>
              </div>
              
              <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
                <li>🎯 Nouvelles fonctionnalités de recherche avancée</li>
                <li>🔒 Système de sécurité renforcé</li>
                <li>📱 Interface mobile optimisée</li>
                <li>💬 Messagerie instantanée améliorée</li>
              </ul>
              
              <a href="${window.location.origin}" class="cta-button">Visiter MaxiMarket</a>
            </div>
            <div class="footer">
              <p>© 2024 MaxiMarket. Tous droits réservés.</p>
              <p><a href="${window.location.origin}/newsletter/unsubscribe?email=${email}">Se désinscrire</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
  
    // ============================================================================
    // TEMPLATES DE NOTIFICATIONS ET ALERTES
    // ============================================================================
  
    // Email de confirmation d'inscription
    subscriptionConfirmation: (email) => ({
      subject: '✅ Confirmation d\'inscription - MaxiMarket',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmation d'inscription</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: #28a745; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; text-align: center; }
            .success-icon { font-size: 4em; margin-bottom: 20px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Inscription confirmée</h1>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              <h2>Votre inscription à la newsletter est confirmée</h2>
              <p>Vous recevrez désormais nos actualités et offres spéciales.</p>
              <p>Adresse email : <strong>${email}</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 MaxiMarket</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
  
    // Email de désinscription
    unsubscribeConfirmation: (email) => ({
      subject: '👋 Désinscription confirmée - MaxiMarket',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Désinscription confirmée</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: #6c757d; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; text-align: center; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👋 Désinscription confirmée</h1>
            </div>
            <div class="content">
              <h2>Vous avez été désinscrit de notre newsletter</h2>
              <p>Adresse email : <strong>${email}</strong></p>
              <p>Vous ne recevrez plus nos newsletters. Vous pouvez vous réinscrire à tout moment.</p>
              <a href="${window.location.origin}/newsletter/subscribe?email=${email}" style="color: #667eea;">Se réinscrire</a>
            </div>
            <div class="footer">
              <p>© 2024 MaxiMarket</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
  
    // ============================================================================
    // TEMPLATES DE NEWSLETTERS ET CAMPAGNES
    // ============================================================================
  
    // Newsletter hebdomadaire
    weeklyNewsletter: (data = {}) => ({
      subject: '📊 Votre résumé MaxiMarket de la semaine',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Newsletter hebdomadaire MaxiMarket</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .stat-card { background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; }
            .stat-number { font-size: 2em; font-weight: bold; color: #667eea; }
            .featured-listings { margin: 30px 0; }
            .listing-card { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em; }
            @media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Votre résumé MaxiMarket</h1>
              <p>Semaine du ${data.weekStart || 'cette semaine'}</p>
            </div>
            
            <div class="content">
              <h2>🚀 Activité de la semaine</h2>
              
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">${data.newListings || '150+'}</div>
                  <p>Nouvelles annonces</p>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${data.activeUsers || '2.5k'}</div>
                  <p>Utilisateurs actifs</p>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${data.transactions || '89'}</div>
                  <p>Transactions</p>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${data.newUsers || '320'}</div>
                  <p>Nouveaux membres</p>
                </div>
              </div>
              
              <h3>🔥 Annonces populaires</h3>
              <div class="featured-listings">
                ${data.featuredListings ? data.featuredListings.map(listing => `
                  <div class="listing-card">
                    <h4>${listing.title}</h4>
                    <p>${listing.price} • ${listing.location}</p>
                    <a href="${window.location.origin}/annonce/${listing.id}" style="color: #667eea;">Voir l'annonce</a>
                  </div>
                `).join('') : '<p>Aucune annonce populaire cette semaine.</p>'}
              </div>
              
              <h3>💡 Conseils de la semaine</h3>
              <ul>
                <li>Optimisez vos photos d'annonces pour plus de visibilité</li>
                <li>Répondez rapidement aux messages pour augmenter vos ventes</li>
                <li>Utilisez des mots-clés pertinents dans vos descriptions</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}/marketplace" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Explorer MaxiMarket</a>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2024 MaxiMarket. Tous droits réservés.</p>
              <p><a href="${window.location.origin}/newsletter/unsubscribe">Se désinscrire</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
  
    // Newsletter mensuelle
    monthlyNewsletter: (data = {}) => ({
      subject: `📈 Rapport mensuel MaxiMarket - ${data.month || 'Ce mois'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rapport mensuel MaxiMarket</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { padding: 30px; }
            .highlight { background: #e3f2fd; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📈 Rapport mensuel MaxiMarket</h1>
              <p>${data.month || 'Ce mois'}</p>
            </div>
            
            <div class="content">
              <div class="highlight">
                <h2>🎯 Performances du mois</h2>
                <p><strong>${data.totalListings || '1,250'}</strong> annonces publiées</p>
                <p><strong>${data.totalUsers || '5,200'}</strong> nouveaux utilisateurs</p>
                <p><strong>${data.totalTransactions || '450'}</strong> transactions réussies</p>
              </div>
              
              <h3>🏆 Top catégories</h3>
              <ol>
                <li>Immobilier (${data.topCategories?.immobilier || '35%'})</li>
                <li>Automobile (${data.topCategories?.automobile || '28%'})</li>
                <li>Services (${data.topCategories?.services || '22%'})</li>
                <li>Marketplace (${data.topCategories?.marketplace || '15%'})</li>
              </ol>
              
              <h3>🚀 Nouvelles fonctionnalités</h3>
              <ul>
                <li>Recherche avancée par localisation</li>
                <li>Messagerie instantanée améliorée</li>
                <li>Système de notation et avis</li>
                <li>Paiements sécurisés intégrés</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}/marketplace" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Découvrir les nouveautés</a>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2024 MaxiMarket. Tous droits réservés.</p>
              <p><a href="${window.location.origin}/newsletter/unsubscribe">Se désinscrire</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
  
    // ============================================================================
    // TEMPLATES DE MARKETING ET PROMOTIONS
    // ============================================================================
  
    // Email de promotion spéciale
    specialOffer: (data = {}) => ({
      subject: `🎁 Offre spéciale MaxiMarket - ${data.offer || 'Réduction exclusive'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Offre spéciale MaxiMarket</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 40px 30px; text-align: center; }
            .offer-banner { background: #fff3cd; border: 2px solid #ffeaa7; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; }
            .offer-code { background: #667eea; color: white; padding: 10px 20px; border-radius: 5px; font-size: 1.2em; font-weight: bold; margin: 10px 0; display: inline-block; }
            .content { padding: 30px; }
            .cta-button { display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎁 Offre spéciale !</h1>
              <p>${data.offer || 'Réduction exclusive pour nos abonnés'}</p>
            </div>
            
            <div class="content">
              <div class="offer-banner">
                <h2>${data.discount || '20%'} de réduction</h2>
                <p>${data.description || 'Sur tous les services premium de MaxiMarket'}</p>
                <div class="offer-code">${data.code || 'NEWSLETTER20'}</div>
                <p><small>Valable jusqu'au ${data.expiryDate || '31 décembre 2024'}</small></p>
              </div>
              
              <h3>🚀 Comment en profiter :</h3>
              <ol>
                <li>Connectez-vous à votre compte MaxiMarket</li>
                <li>Choisissez un service premium</li>
                <li>Entrez le code promo lors du paiement</li>
                <li>Profitez de votre réduction !</li>
              </ol>
              
              <h3>💎 Services éligibles :</h3>
              <ul>
                <li>Boost d'annonces</li>
                <li>Compte premium</li>
                <li>Services de vérification</li>
                <li>Support prioritaire</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${window.location.origin}/premium" class="cta-button">Profiter de l'offre</a>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2024 MaxiMarket. Tous droits réservés.</p>
              <p><a href="${window.location.origin}/newsletter/unsubscribe">Se désinscrire</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
  
    // Email de réactivation (pour utilisateurs inactifs)
    reengagementEmail: (data = {}) => ({
      subject: '👋 On vous a manqué sur MaxiMarket !',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Revenez sur MaxiMarket</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { padding: 30px; }
            .highlight { background: #e3f2fd; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👋 On vous a manqué !</h1>
              <p>Revenez découvrir ce qui a changé sur MaxiMarket</p>
            </div>
            
            <div class="content">
              <h2>Bonjour ${data.firstName || 'Cher utilisateur'} !</h2>
              
              <p>Il y a ${data.daysInactive || 'quelques temps'} que vous n'avez pas visité MaxiMarket. Nous avons de nombreuses nouveautés à vous faire découvrir !</p>
              
              <div class="highlight">
                <h3>🆕 Ce qui a changé :</h3>
                <ul>
                  <li>Interface utilisateur modernisée</li>
                  <li>Nouvelles fonctionnalités de recherche</li>
                  <li>Système de messagerie amélioré</li>
                  <li>Plus de ${data.newListings || '500'} nouvelles annonces</li>
                </ul>
              </div>
              
              <h3>🔥 Annonces populaires qui pourraient vous intéresser :</h3>
              <p>Découvrez les dernières annonces dans vos catégories préférées.</p>
              
              <div style="text-align: center;">
                <a href="${window.location.origin}/marketplace" class="cta-button">Revenir sur MaxiMarket</a>
              </div>
              
              <p><small>Si vous ne souhaitez plus recevoir ces emails, vous pouvez vous <a href="${window.location.origin}/newsletter/unsubscribe">désinscrire</a>.</small></p>
            </div>
            
            <div class="footer">
              <p>© 2024 MaxiMarket. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
  
    // ============================================================================
    // TEMPLATES DE NOTIFICATIONS SYSTÈME
    // ============================================================================
  
    // Email de maintenance
    maintenanceNotification: (data = {}) => ({
      subject: '🔧 Maintenance programmée - MaxiMarket',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Maintenance programmée</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: #ffc107; color: #333; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .maintenance-info { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔧 Maintenance programmée</h1>
            </div>
            <div class="content">
              <h2>Maintenance prévue</h2>
              <div class="maintenance-info">
                <p><strong>Date :</strong> ${data.date || 'Prochainement'}</p>
                <p><strong>Durée :</strong> ${data.duration || '2 heures'}</p>
                <p><strong>Heure :</strong> ${data.time || '02:00 - 04:00 UTC'}</p>
              </div>
              
              <h3>🛠️ Ce qui sera amélioré :</h3>
              <ul>
                <li>Performance du système</li>
                <li>Sécurité renforcée</li>
                <li>Nouvelles fonctionnalités</li>
                <li>Corrections de bugs</li>
              </ul>
              
              <p>Nous nous excusons pour la gêne occasionnée. La maintenance est nécessaire pour améliorer votre expérience.</p>
            </div>
            <div class="footer">
              <p>© 2024 MaxiMarket. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),

    // Email de notification de sécurité
    securityAlert: (data = {}) => ({
      subject: '🔒 Alerte de sécurité - MaxiMarket',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Alerte de sécurité</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: #dc3545; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .alert-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .cta-button { display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Alerte de sécurité</h1>
            </div>
            <div class="content">
              <div class="alert-box">
                <h3>${data.alertType || 'Connexion suspecte détectée'}</h3>
                <p>${data.message || 'Une connexion inhabituelle a été détectée sur votre compte.'}</p>
              </div>
              
              <h3>📍 Détails de la connexion :</h3>
              <ul>
                <li><strong>Date :</strong> ${data.date || new Date().toLocaleString()}</li>
                <li><strong>Localisation :</strong> ${data.location || 'Non déterminée'}</li>
                <li><strong>Appareil :</strong> ${data.device || 'Non déterminé'}</li>
                <li><strong>IP :</strong> ${data.ip || 'Non déterminée'}</li>
              </ul>
              
              <h3>🛡️ Actions recommandées :</h3>
              <ol>
                <li>Changer votre mot de passe immédiatement</li>
                <li>Activer l'authentification à deux facteurs</li>
                <li>Vérifier vos connexions actives</li>
                <li>Nous contacter si vous n'êtes pas à l'origine de cette connexion</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="${window.location.origin}/security" class="cta-button">Sécuriser mon compte</a>
              </div>
            </div>
            <div class="footer">
              <p>© 2024 MaxiMarket. Tous droits réservés.</p>
              <p>Si vous n'êtes pas à l'origine de cette connexion, contactez-nous immédiatement.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),

    // ============================================================================
    // TEMPLATES DE NOTIFICATIONS UTILISATEUR
    // ============================================================================

    // Email de confirmation de création de compte
    accountCreated: (data = {}) => ({
      subject: '✅ Compte créé avec succès - MaxiMarket',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Compte créé</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: #28a745; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .welcome-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .cta-button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Compte créé avec succès !</h1>
            </div>
            <div class="content">
              <div class="welcome-box">
                <h2>Bienvenue ${data.firstName || 'sur MaxiMarket'} !</h2>
                <p>Votre compte a été créé avec succès. Vous pouvez maintenant profiter de toutes nos fonctionnalités.</p>
              </div>
              
              <h3>🚀 Prochaines étapes :</h3>
              <ol>
                <li>Complétez votre profil</li>
                <li>Ajoutez vos premières annonces</li>
                <li>Explorez le marketplace</li>
                <li>Connectez-vous avec d'autres utilisateurs</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="${window.location.origin}/dashboard" class="cta-button">Accéder à mon compte</a>
              </div>
            </div>
            <div class="footer">
              <p>© 2024 MaxiMarket. Tous droits réservés.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),

    // Email de réinitialisation de mot de passe
    passwordReset: (data = {}) => ({
      subject: '🔑 Réinitialisation de mot de passe - MaxiMarket',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Réinitialisation de mot de passe</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: #17a2b8; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .reset-box { background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .cta-button { display: inline-block; background: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔑 Réinitialisation de mot de passe</h1>
            </div>
            <div class="content">
              <div class="reset-box">
                <h2>Demande de réinitialisation</h2>
                <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.</p>
              </div>
              
              <p><strong>Important :</strong> Ce lien expire dans ${data.expiryTime || '1 heure'}. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
              
              <div style="text-align: center;">
                <a href="${data.resetLink || '#'}" class="cta-button">Réinitialiser mon mot de passe</a>
              </div>
              
              <h3>🔒 Conseils de sécurité :</h3>
              <ul>
                <li>Choisissez un mot de passe fort et unique</li>
                <li>N'utilisez pas le même mot de passe sur d'autres sites</li>
                <li>Activez l'authentification à deux facteurs</li>
                <li>Ne partagez jamais vos identifiants</li>
              </ul>
            </div>
            <div class="footer">
              <p>© 2024 MaxiMarket. Tous droits réservés.</p>
              <p>Si vous n'avez pas demandé cette réinitialisation, contactez-nous immédiatement.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
  };

  // ============================================================================
  // FONCTIONS UTILITAIRES
  // ============================================================================

  // Obtenir un template par nom
  export const getTemplate = (templateName, data = {}) => {
    if (!emailTemplates[templateName]) {
      throw new Error(`Template '${templateName}' non trouvé`);
    }
    return emailTemplates[templateName](data);
  };

  // Lister tous les templates disponibles
  export const getAvailableTemplates = () => {
    return Object.keys(emailTemplates);
  };

  // Vérifier si un template existe
  export const templateExists = (templateName) => {
    return !!emailTemplates[templateName];
  };

  export default emailTemplates;