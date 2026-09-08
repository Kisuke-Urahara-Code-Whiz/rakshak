require('dotenv').config();

module.exports = {
  expo: {
    name: 'Rakshak',
    slug: 'Rakshak',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/logo.png',
    scheme: 'user',
    userInterfaceStyle: 'automatic',
    ios: {
      icon: './assets/images/logo-nobg.png',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#FFFFFF',
        foregroundImage: './assets/images/logo-nobg.png',
        monochromeImage: './assets/images/logo-nobg.png',
      },
      predictiveBackGestureEnabled: false,
      package: 'com.sougatacodewhiz.user',
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#FFFFFF',
          image: './assets/images/logo-nobg.png',
          imageWidth: 76,
        },
      ],
      'expo-audio',
      [
        'expo-build-properties',
        {
          android: {
            networkSecurityConfig: './network-security-config.xml',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      ngrokHost: process.env.NGROK_HOST || '7706-152-58-181-7.ngrok-free.app',
    },
  },
};