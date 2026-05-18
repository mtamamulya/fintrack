import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId  : 'com.yourcompany.fintrack',
  appName: 'FinTrack',
  webDir : 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor   : '#0f172a',
      showSpinner       : false,
    },
    StatusBar: {
      style          : 'DARK',
      backgroundColor: '#0f172a',
    },
  },
}

export default config
