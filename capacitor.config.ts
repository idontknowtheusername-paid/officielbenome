import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.maximarket.app',
  appName: 'MaxiMarket - Marketplace',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#ffffff",
      showSpinner: true,
      spinnerColor: "#999999",
      spinnerStyle: "large"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: "#ffffff"
    },
    Keyboard: {
      resize: 'body',
      style: 'dark'
    }
  }
};

export default config;
