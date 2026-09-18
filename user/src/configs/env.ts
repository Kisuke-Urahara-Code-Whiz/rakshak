import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_NGROK_HOST = '7706-152-58-181-7.ngrok-free.app';

export const NGROK_HOST: string =
  Constants.expoConfig?.extra?.ngrokHost ??
  Constants.manifest2?.extra?.expoClient?.extra?.ngrokHost ??
  DEFAULT_NGROK_HOST;

// Dynamically extract development machine LAN IP when running on Expo Go (physical phone or emulator)
const lanHost = Constants.expoConfig?.hostUri
  ? Constants.expoConfig.hostUri.split(':')[0]
  : null;

const LOCAL_GATEWAY = lanHost
  ? `${lanHost}:5001`
  : Platform.OS === 'android'
  ? '10.0.2.2:5001'
  : 'localhost:5001';

export const CLOUD_API_URL = `https://${NGROK_HOST}`;

export const API_BASE_URL = 'https://telesthetic-tridimensionally-margarete.ngrok-free.dev'

export const WS_BASE_URL =
  Constants.expoConfig?.extra?.wsUrl ??
  (Platform.OS === 'web' ? 'ws://localhost:5001' : `ws://${LOCAL_GATEWAY}`);

