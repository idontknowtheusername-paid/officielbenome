# 📧 Templates HTML pour Brevo - MaxiMarket

Ce document contient les templates HTML à copier dans Brevo pour chaque type d'email.

## 🎨 Palette de Couleurs MaxiMarket

```css
--primary: #667eea;
--primary-dark: #5a6fd8;
--secondary: #764ba2;
--success: #28a745;
--warning: #ffc107;
--danger: #dc3545;
--info: #17a2b8;
--light: #f8f9fa;
--dark: #343a40;
```

## 📝 Template 1 : Welcome Newsletter

**ID Brevo**: 1  
**Nom**: Welcome Newsletter MaxiMarket  
**Sujet**: 🎉 Bienvenue sur MaxiMarket !

### Variables
- `{{params.FIRST_NAME}}` - Prénom de l'utilisateur
- `{{params.EMAIL}}` - Email de l'utilisateur
- `{{params.APP_URL}}` - URL de l'application
- `{{params.MARKETPLACE_URL}}` - URL du marketplace
- `{{params.CREATE_LISTING_URL}}` - URL création d'annonce

### HTML Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur MaxiMarket</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 10px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 2.5em; font-weight: 700;">🎉 Bienvenue sur MaxiMarket !</h1>
              <p style="margin: 10px 0 0 0; font-size: 1.2em; opacity: 0.9;">Votre marketplace de confiance pour l'Afrique de l'Ouest</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2>Bonjour {{params.FIRST_NAME}} !</h2>
              <p style="font-size: 1.1em; line-height: 1.6;">Merci de vous être inscrit à notre newsletter ! Vous recevrez désormais nos dernières actualités, offres spéciales et conseils pour optimiser votre expérience sur MaxiMarket.</p>
              
              <h3 style="color: #667eea; margin-top: 30px;">🚀 Découvrez nos fonctionnalités :</h3>
              
              <table width="100%" cellpadding="10" cellspacing="0">
                <tr>
                  <td width="50%" style="padding: 10px;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea;">
                      <h4 style="margin: 0 0 10px 0; color: #667eea;">🏠 Immobilier</h4>
                      <p style="margin: 0; font-size: 0.9em;">Achetez, vendez ou louez des biens immobiliers en toute sécurité.</p>
                    </div>
                  </td>
                  <td width="50%" style="padding: 10px;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea;">
                      <h4 style="margin: 0 0 10px 0; color: #667eea;">🚗 Automobile</h4>
                      <p style="margin: 0; font-size: 0.9em;">Trouvez votre véhicule idéal parmi des milliers d'annonces.</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="{{params.MARKETPLACE_URL}}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">Explorer MaxiMarket</a>
              </div>
              
              <div style="background: #e3f2fd; padding: 25px; border-radius: 10px; margin: 30px 0;">
                <h3 style="color: #1976d2; margin-top: 0;">💡 Conseils pour bien commencer :</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li style="margin: 8px 0;">Complétez votre profil pour plus de visibilité</li>
                  <li style="margin: 8px 0;">Ajoutez des photos de qualité à vos annonces</li>
                  <li style="margin: 8px 0;">Répondez rapidement aux messages</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 0.9em;">
              <p>© {{params.CURRENT_YEAR}} MaxiMarket. Tous droits réservés.</p>
              <p>Vous recevez cet email car vous vous êtes inscrit à notre newsletter.</p>
              <p><a href="{{params.UNSUBSCRIBE_URL}}" style="color: #667eea; text-decoration: none;">Se désinscrire</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 📝 Template 5 : Weekly Newsletter

**ID Brevo**: 5  
**Nom**: Weekly Newsletter MaxiMarket  
**Sujet**: 📊 Votre résumé MaxiMarket de la semaine

### Variables
- `{{params.WEEK_START}}` - Date de début de semaine
- `{{params.NEW_LISTINGS}}` - Nombre de nouvelles annonces
- `{{params.ACTIVE_USERS}}` - Nombre d'utilisateurs actifs
- `{{params.TRANSACTIONS}}` - Nombre de transactions
- `{{params.NEW_USERS}}` - Nombre de nouveaux utilisateurs

### HTML Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter Hebdomadaire</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 10px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 2em;">📊 Votre résumé MaxiMarket</h1>
              <p style="margin: 10px 0 0 0; font-size: 1.1em;">Semaine du {{params.WEEK_START}}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2>🚀 Activité de la semaine</h2>
              
              <table width="100%" cellpadding="10" cellspacing="0">
                <tr>
                  <td width="50%" style="padding: 10px;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                      <div style="font-size: 2em; font-weight: bold; color: #667eea;">{{params.NEW_LISTINGS}}</div>
                      <p style="margin: 5px 0 0 0;">Nouvelles annonces</p>
                    </div>
                  </td>
                  <td width="50%" style="padding: 10px;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                      <div style="font-size: 2em; font-weight: bold; color: #667eea;">{{params.ACTIVE_USERS}}</div>
                      <p style="margin: 5px 0 0 0;">Utilisateurs actifs</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{params.MARKETPLACE_URL}}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 600;">Explorer MaxiMarket</a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em;">
              <p>© {{params.CURRENT_YEAR}} MaxiMarket. Tous droits réservés.</p>
              <p><a href="{{params.UNSUBSCRIBE_URL}}" style="color: #667eea; text-decoration: none;">Se désinscrire</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 📝 Template 7 : Special Offer

**ID Brevo**: 7  
**Nom**: Special Offer MaxiMarket  
**Sujet**: 🎁 Offre spéciale MaxiMarket

### Variables
- `{{params.OFFER_TITLE}}` - Titre de l'offre
- `{{params.DISCOUNT}}` - Pourcentage de réduction
- `{{params.PROMO_CODE}}` - Code promo
- `{{params.EXPIRY_DATE}}` - Date d'expiration
- `{{params.CTA_URL}}` - URL du call-to-action

### HTML Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offre Spéciale</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 10px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 2.5em;">🎁 Offre spéciale !</h1>
              <p style="margin: 10px 0 0 0; font-size: 1.2em;">{{params.OFFER_TITLE}}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <div style="background: #fff3cd; border: 2px solid #ffeaa7; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                <h2 style="margin: 0 0 10px 0; color: #856404;">{{params.DISCOUNT}} de réduction</h2>
                <div style="background: #667eea; color: white; padding: 10px 20px; border-radius: 5px; font-size: 1.2em; font-weight: bold; margin: 10px 0; display: inline-block;">
                  {{params.PROMO_CODE}}
                </div>
                <p style="margin: 10px 0 0 0; font-size: 0.9em; color: #856404;">Valable jusqu'au {{params.EXPIRY_DATE}}</p>
              </div>
              
              <h3>🚀 Comment en profiter :</h3>
              <ol style="line-height: 1.8;">
                <li>Connectez-vous à votre compte MaxiMarket</li>
                <li>Choisissez un service premium</li>
                <li>Entrez le code promo lors du paiement</li>
                <li>Profitez de votre réduction !</li>
              </ol>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{params.CTA_URL}}" style="display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1.1em;">Profiter de l'offre</a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em;">
              <p>© {{params.CURRENT_YEAR}} MaxiMarket. Tous droits réservés.</p>
              <p><a href="{{params.UNSUBSCRIBE_URL}}" style="color: #667eea; text-decoration: none;">Se désinscrire</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 📝 Template 12 : Password Reset

**ID Brevo**: 12  
**Nom**: Password Reset MaxiMarket  
**Sujet**: 🔐 Réinitialisation de votre mot de passe

### Variables
- `{{params.FIRST_NAME}}` - Prénom de l'utilisateur
- `{{params.RESET_URL}}` - URL de réinitialisation
- `{{params.EXPIRY_TIME}}` - Durée de validité du lien

### HTML Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation Mot de Passe</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 10px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: #667eea; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 2em;">🔐 Réinitialisation de mot de passe</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2>Bonjour {{params.FIRST_NAME}},</h2>
              <p style="font-size: 1.1em; line-height: 1.6;">Vous avez demandé à réinitialiser votre mot de passe MaxiMarket. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{params.RESET_URL}}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1.1em;">Réinitialiser mon mot de passe</a>
              </div>
              
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;"><strong>⚠️ Important :</strong> Ce lien est valable pendant {{params.EXPIRY_TIME}}. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
              </div>
              
              <p style="font-size: 0.9em; color: #666; margin-top: 30px;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
              <p style="font-size: 0.9em; color: #667eea; word-break: break-all;">{{params.RESET_URL}}</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em;">
              <p>© {{params.CURRENT_YEAR}} MaxiMarket. Tous droits réservés.</p>
              <p>Besoin d'aide ? <a href="mailto:{{params.SUPPORT_EMAIL}}" style="color: #667eea; text-decoration: none;">Contactez-nous</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 📋 Instructions d'Utilisation

1. **Créer un template dans Brevo** :
   - Allez dans Campagnes > Templates
   - Cliquez sur "Créer un template"
   - Choisissez "Code HTML"

2. **Copier le HTML** :
   - Copiez le code HTML du template souhaité
   - Collez-le dans l'éditeur Brevo

3. **Configurer les variables** :
   - Vérifiez que toutes les variables `{{params.XXX}}` sont présentes
   - Testez le rendu avec des données de test

4. **Sauvegarder et noter l'ID** :
   - Sauvegardez le template
   - Notez l'ID du template
   - Mettez à jour `BREVO_TEMPLATE_IDS` dans `brevo-templates.service.js`

5. **Tester l'envoi** :
   - Utilisez le script `test-brevo-integration.js`
   - Vérifiez la réception et le rendu

## 🎨 Personnalisation

Vous pouvez personnaliser les templates en modifiant :
- Les couleurs (utilisez la palette MaxiMarket)
- Les textes et messages
- Les images et logos
- La structure et mise en page

## 📱 Responsive Design

Tous les templates sont optimisés pour :
- Desktop (600px)
- Tablet (adaptatif)
- Mobile (adaptatif)

Testez toujours sur différents clients email (Gmail, Outlook, Apple Mail, etc.)
