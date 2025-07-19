// Utilitaire pour tester la connectivité API
import { API_BASE_URL } from '@/config/api.config';

export const testApiConnection = async () => {
  try {
    console.log('Testing API connection to:', API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Health Check Success:', data);
      return { success: true, data };
    } else {
      console.error('API Health Check Failed:', response.status, response.statusText);
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
  } catch (error) {
    console.error('API Connection Test Failed:', error);
    return { success: false, error: error.message };
  }
};

// Test de connectivité au chargement de l'app
export const initApiTest = () => {
  if (import.meta.env.DEV) {
    console.log('🔍 Testing API connectivity...');
    testApiConnection().then(result => {
      if (result.success) {
        console.log('✅ API is reachable');
      } else {
        console.error('❌ API is not reachable:', result.error);
        console.log('💡 Make sure the backend server is running');
      }
    });
  }
};