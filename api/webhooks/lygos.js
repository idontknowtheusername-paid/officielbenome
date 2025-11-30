// ============================================================================
// WEBHOOK LYGOS - GESTION DES NOTIFICATIONS DE PAIEMENT
// ============================================================================
// Ce webhook reçoit les notifications de Lygos pour les paiements

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Vérifier que c'est une requête POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    
    console.log('📥 Webhook Lygos reçu:', {
      event: payload.event,
      reference: payload.data?.reference,
      status: payload.data?.status
    });

    // Vérifier la signature du webhook (si Lygos le supporte)
    // const signature = req.headers['x-lygos-signature'];
    // if (!verifySignature(payload, signature)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    const { event, data } = payload;

    // Gérer les différents événements
    switch (event) {
      case 'payment.successful':
      case 'payment.completed':
        await handlePaymentSuccess(data);
        break;

      case 'payment.failed':
        await handlePaymentFailed(data);
        break;

      case 'payment.cancelled':
        await handlePaymentCancelled(data);
        break;

      case 'refund.successful':
        await handleRefundSuccess(data);
        break;

      default:
        console.log('⚠️  Événement non géré:', event);
    }

    // Répondre à Lygos
    res.status(200).json({ 
      success: true, 
      message: 'Webhook traité avec succès' 
    });

  } catch (error) {
    console.error('❌ Erreur webhook Lygos:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Gérer un paiement réussi
async function handlePaymentSuccess(data) {
  const { reference, amount, metadata } = data;

  console.log('✅ Paiement réussi:', reference);

  // Récupérer les métadonnées du paiement
  const { boostId, listingId, userId } = metadata || {};

  if (!boostId) {
    console.warn('⚠️  Pas de boostId dans les métadonnées');
    return;
  }

  try {
    // Activer le boost
    const { data: boost, error: boostError } = await supabase
      .from('listing_boosts')
      .select('*, boost_packages(*)')
      .eq('id', boostId)
      .single();

    if (boostError || !boost) {
      throw new Error('Boost non trouvé');
    }

    // Calculer la date d'expiration
    const expiresAt = new Date(
      Date.now() + boost.boost_packages.duration_days * 24 * 60 * 60 * 1000
    );

    // Mettre à jour le boost
    const { error: updateError } = await supabase
      .from('listing_boosts')
      .update({
        status: 'active',
        activated_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_reference: reference,
        payment_amount: amount
      })
      .eq('id', boostId);

    if (updateError) throw updateError;

    // Mettre à jour l'annonce
    const { error: listingError } = await supabase
      .from('listings')
      .update({
        is_boosted: true,
        boost_expires_at: expiresAt.toISOString()
      })
      .eq('id', listingId);

    if (listingError) {
      console.warn('⚠️  Erreur mise à jour annonce:', listingError);
    }

    // Créer une notification pour l'utilisateur
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'boost_activated',
        title: 'Boost activé',
        message: `Votre annonce a été boostée avec succès pour ${boost.boost_packages.duration_days} jours`,
        data: {
          boostId,
          listingId,
          reference
        }
      });

    console.log('✅ Boost activé avec succès:', boostId);

  } catch (error) {
    console.error('❌ Erreur activation boost:', error);
    throw error;
  }
}

// Gérer un paiement échoué
async function handlePaymentFailed(data) {
  const { reference, metadata } = data;

  console.log('❌ Paiement échoué:', reference);

  const { boostId, userId } = metadata || {};

  if (!boostId) return;

  try {
    // Mettre à jour le boost
    await supabase
      .from('listing_boosts')
      .update({
        status: 'failed',
        payment_reference: reference
      })
      .eq('id', boostId);

    // Créer une notification
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'payment_failed',
        title: 'Paiement échoué',
        message: 'Le paiement de votre boost a échoué. Veuillez réessayer.',
        data: {
          boostId,
          reference
        }
      });

    console.log('✅ Paiement échoué traité:', boostId);

  } catch (error) {
    console.error('❌ Erreur traitement échec:', error);
  }
}

// Gérer un paiement annulé
async function handlePaymentCancelled(data) {
  const { reference, metadata } = data;

  console.log('🚫 Paiement annulé:', reference);

  const { boostId } = metadata || {};

  if (!boostId) return;

  try {
    await supabase
      .from('listing_boosts')
      .update({
        status: 'cancelled',
        payment_reference: reference,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', boostId);

    console.log('✅ Paiement annulé traité:', boostId);

  } catch (error) {
    console.error('❌ Erreur traitement annulation:', error);
  }
}

// Gérer un remboursement réussi
async function handleRefundSuccess(data) {
  const { reference, original_reference } = data;

  console.log('💰 Remboursement réussi:', reference);

  try {
    // Trouver le boost associé
    const { data: boost } = await supabase
      .from('listing_boosts')
      .select('*')
      .eq('payment_reference', original_reference)
      .single();

    if (!boost) {
      console.warn('⚠️  Boost non trouvé pour le remboursement');
      return;
    }

    // Désactiver le boost
    await supabase
      .from('listing_boosts')
      .update({
        status: 'refunded',
        refund_reference: reference,
        refunded_at: new Date().toISOString()
      })
      .eq('id', boost.id);

    // Mettre à jour l'annonce
    await supabase
      .from('listings')
      .update({
        is_boosted: false,
        boost_expires_at: null
      })
      .eq('id', boost.listing_id);

    // Créer une notification
    await supabase
      .from('notifications')
      .insert({
        user_id: boost.user_id,
        type: 'refund_successful',
        title: 'Remboursement effectué',
        message: 'Votre paiement a été remboursé avec succès',
        data: {
          boostId: boost.id,
          reference
        }
      });

    console.log('✅ Remboursement traité:', boost.id);

  } catch (error) {
    console.error('❌ Erreur traitement remboursement:', error);
  }
}
