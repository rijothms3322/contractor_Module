import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medimz.app',
  appName: 'Medimz',
  webDir: 'out',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      //Dev
      serverClientId: '377950550538-ioghl0itm300s5bvd3mhb6qc9v4n754a.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;