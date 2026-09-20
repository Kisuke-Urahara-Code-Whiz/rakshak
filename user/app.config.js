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
      ngrokHost: process.env.NGROK_HOST || 'telesthetic-tridimensionally-margarete.ngrok-free.dev',
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || process.env.API_BASE_URL,
      wsUrl: process.env.EXPO_PUBLIC_WS_URL || process.env.WS_URL,
      pythonWsHost: process.env.EXPO_PUBLIC_PYTHON_WS_HOST || process.env.PYTHON_WS_HOST || 'localhost:8000',
      pythonWsUrl: process.env.EXPO_PUBLIC_PYTHON_WS_URL || process.env.PYTHON_WS_URL,
    },
  },
};