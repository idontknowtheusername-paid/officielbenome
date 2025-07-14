import JwtService from './services/jwt.service.js';
import { JWT_CONFIG } from './config/constants.js';

// Test simple du service JWT
async function testJWT() {
  try {
    console.log('🧪 Test du service JWT...');
    
    // Simuler un utilisateur
    const mockUser = {
      id: 'test-user-id',
      role: 'user'
    };
    
    console.log('📋 Configuration JWT:');
    console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '[DÉFINI]' : '[NON DÉFINI]');
    console.log('  JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? '[DÉFINI]' : '[NON DÉFINI]');
    console.log('  JWT_CONFIG.REFRESH_SECRET:', JWT_CONFIG.REFRESH_SECRET);
    
    // Tester la génération de tokens
    console.log('\n🔄 Génération de tokens...');
    const tokens = await JwtService.generateTokens(mockUser);
    
    console.log('✅ Tokens générés avec succès:');
    console.log('  Access Token:', tokens.accessToken ? '[GÉNÉRÉ]' : '[ÉCHEC]');
    console.log('  Refresh Token:', tokens.refreshToken ? '[GÉNÉRÉ]' : '[ÉCHEC]');
    
    // Tester la vérification du token d'accès
    console.log('\n🔍 Vérification du token d\'accès...');
    const decodedAccess = await JwtService.verifyAccessToken(tokens.accessToken);
    console.log('✅ Token d\'accès valide:', decodedAccess);
    
    // Tester la vérification du refresh token
    console.log('\n🔍 Vérification du refresh token...');
    const decodedRefresh = await JwtService.verifyRefreshToken(tokens.refreshToken);
    console.log('✅ Refresh token valide:', decodedRefresh);
    
    console.log('\n🎉 Tous les tests JWT sont passés !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test JWT:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le test
testJWT(); 