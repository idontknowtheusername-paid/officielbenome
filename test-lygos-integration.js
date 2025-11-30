// ============================================================================
// TEST D'INTÉGRATION LYGOS
// ============================================================================
// Ce script teste l'intégration complète avec l'API Lygos

import { lygosService } from './src/services/payment/lygos.service.js';

console.log('🧪 Test d\'intégration Lygos\n');

// Vérifier la configuration
console.log('1️⃣ Vérification de la configuration...');
const isConfigured = lygosService.isConfigured();
console.log(`   ${isConfigured ? '✅' : '❌'} Lygos ${isConfigured ? 'configuré' : 'NON configuré'}\n`);

if (!isConfigured) {
  console.log('⚠️  Veuillez configurer VITE_LYGOS_API_KEY dans .env.local');
  console.log('   Clé API: lygosapp-5798fac9-f420-4aea-9196-d9b4313d6ab6\n');
  process.exit(1);
}

// Test 1: Obtenir les informations du compte
async function testAccountInfo() {
  console.log('2️⃣ Test: Informations du compte...');
  try {
    const result = await lygosService.getAccountInfo();
    if (result.success) {
      console.log('   ✅ Compte récupéré avec succès');
      console.log('   📊 Données:', JSON.stringify(result.data, null, 2));
    } else {
      console.log('   ❌ Erreur:', result.message);
    }
  } catch (error) {
    console.log('   ❌ Exception:', error.message);
  }
  console.log('');
}

// Test 2: Obtenir les méthodes de paiement
async function testPaymentMethods() {
  console.log('3️⃣ Test: Méthodes de paiement disponibles...');
  try {
    const result = await lygosService.getPaymentMethods();
    if (result.success) {
      console.log('   ✅ Méthodes récupérées avec succès');
      console.log('   💳 Méthodes:', result.data);
    } else {
      console.log('   ❌ Erreur:', result.message);
    }
  } catch (error) {
    console.log('   ❌ Exception:', error.message);
  }
  console.log('');
}

// Test 3: Initialiser un paiement de test
async function testPaymentInitialization() {
  console.log('4️⃣ Test: Initialisation d\'un paiement...');
  try {
    const paymentData = {
      amount: 1000, // 1000 XOF
      currency: 'XOF',
      description: 'Test paiement MaxiMarket',
      customerName: 'Test User',
      customerEmail: 'test@maximarket.com',
      customerPhone: '+221771234567',
      returnUrl: 'http://localhost:5173/payment-callback?reference={reference}&status=success',
      cancelUrl: 'http://localhost:5173/payment-callback?status=cancelled',
      metadata: {
        test: true,
        source: 'integration-test'
      }
    };

    const result = await lygosService.initializePayment(paymentData);
    
    if (result.success) {
      console.log('   ✅ Paiement initialisé avec succès');
      console.log('   📝 Référence:', result.data.reference);
      console.log('   🔗 URL de paiement:', result.data.paymentUrl);
      console.log('   💰 Montant:', result.data.amount, result.data.currency);
      console.log('   📊 Statut:', result.data.status);
      
      // Sauvegarder la référence pour les tests suivants
      return result.data.reference;
    } else {
      console.log('   ❌ Erreur:', result.message);
      return null;
    }
  } catch (error) {
    console.log('   ❌ Exception:', error.message);
    return null;
  }
  console.log('');
}

// Test 4: Vérifier un paiement
async function testPaymentVerification(reference) {
  if (!reference) {
    console.log('5️⃣ Test: Vérification d\'un paiement - IGNORÉ (pas de référence)\n');
    return;
  }

  console.log('5️⃣ Test: Vérification d\'un paiement...');
  try {
    const result = await lygosService.verifyPayment(reference);
    
    if (result.success) {
      console.log('   ✅ Paiement vérifié avec succès');
      console.log('   📝 Référence:', result.data.reference);
      console.log('   📊 Statut:', result.data.status);
      console.log('   💰 Montant:', result.data.amount, result.data.currency);
      console.log('   ✔️  Payé:', result.isPaid ? 'Oui' : 'Non');
    } else {
      console.log('   ❌ Erreur:', result.message);
    }
  } catch (error) {
    console.log('   ❌ Exception:', error.message);
  }
  console.log('');
}

// Test 5: Obtenir la liste des paiements
async function testGetPayments() {
  console.log('6️⃣ Test: Liste des paiements...');
  try {
    const result = await lygosService.getPayments({
      page: 1,
      limit: 5
    });
    
    if (result.success) {
      console.log('   ✅ Paiements récupérés avec succès');
      console.log('   📊 Nombre de paiements:', result.data?.length || 0);
      if (result.pagination) {
        console.log('   📄 Pagination:', result.pagination);
      }
    } else {
      console.log('   ❌ Erreur:', result.message);
    }
  } catch (error) {
    console.log('   ❌ Exception:', error.message);
  }
  console.log('');
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════\n');
  
  await testAccountInfo();
  await testPaymentMethods();
  const reference = await testPaymentInitialization();
  await testPaymentVerification(reference);
  await testGetPayments();
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ Tests terminés\n');
  console.log('📝 Notes:');
  console.log('   - Les paiements de test ne seront pas réellement débités');
  console.log('   - Utilisez le dashboard Lygos pour voir les transactions');
  console.log('   - Dashboard: https://pay.lygosapp.com/dashboard\n');
}

// Lancer les tests
runAllTests().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
