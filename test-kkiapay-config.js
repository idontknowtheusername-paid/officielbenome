// ============================================================================
// TEST CONFIGURATION KKIAPAY
// ============================================================================

console.log('🔍 Test configuration Kkiapay...');

// Vérifier les variables d'environnement
const kkiapayConfig = {
  publicKey: import.meta.env.VITE_KKIAPAY_PUBLIC_KEY,
  secretKey: import.meta.env.VITE_KKIAPAY_SECRET_KEY,
  baseUrl: 'https://api.kkiapay.me'
};

console.log('📋 Configuration Kkiapay:');
console.log('  Public Key:', kkiapayConfig.publicKey ? '✅ Configurée' : '❌ MANQUANTE');
console.log('  Secret Key:', kkiapayConfig.secretKey ? '✅ Configurée' : '❌ MANQUANTE');
console.log('  Base URL:', kkiapayConfig.baseUrl);

// Test de l'API Kkiapay
async function testKkiapayAPI() {
  if (!kkiapayConfig.publicKey || !kkiapayConfig.secretKey) {
    console.error('❌ Kkiapay non configuré - Impossible de tester');
    return;
  }

  try {
    console.log('🧪 Test de l\'API Kkiapay...');
    
    const response = await fetch(`${kkiapayConfig.baseUrl}/api/v1/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${kkiapayConfig.publicKey}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    console.log('✅ API Kkiapay accessible:', result);
    
  } catch (error) {
    console.error('❌ Erreur API Kkiapay:', error.message);
  }
}

// Exécuter le test
testKkiapayAPI();

export { kkiapayConfig };
