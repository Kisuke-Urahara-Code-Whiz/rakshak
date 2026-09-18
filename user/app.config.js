require('dotenv').config();

module.exports = {
  expo: {
    name: 'Rakshak',
    slug: 'Rakshak',
    version: '1.5.17',
    orientation: 'portrait',
    icon: './assets/images/LogoV3.png',
    scheme: 'user',
    userInterfaceStyle: 'automatic',
    ios: {
      icon: './assets/images/LogoV3.png',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#FFFFFF',
        foregroundImage: './assets/images/LogoV3.png',
        monochromeImage: './assets/images/LogoV3.png',
      },
      predictiveBackGestureEnabled: false,
      package: 'com.sougatacodewhiz.user',
    },
    web: {
      output: 'static',
      favicon: './assets/images/LogoV3.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#FFFFFF',
          image: './assets/images/LogoV3.png',
          imageWidth: 250,
        },
      ],
      'expo-audio',
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