import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_NGROK_HOST = 'foil-unripe-blip.ngrok-free.dev';

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

export const CLOUD_API_URL = `http://${NGROK_HOST}`;

const configuredApiUrl =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_BASE_URL: string =
  configuredApiUrl ||
  (NGROK_HOST ? `http://${NGROK_HOST}` : `http://${LOCAL_GATEWAY}`);

const configuredWsUrl =
  Constants.expoConfig?.extra?.wsUrl ||
  process.env.EXPO_PUBLIC_WS_URL;

export const WS_BASE_URL: string =
  configuredWsUrl ||
  (Platform.OS === 'web'
    ? 'ws://localhost:5001'
    : NGROK_HOST
    ? `ws://${NGROK_HOST}`
    : `ws://${LOCAL_GATEWAY}`);

export const PYTHON_WS_HOST: string =
  Constants.expoConfig?.extra?.pythonWsHost ||
  process.env.EXPO_PUBLIC_PYTHON_WS_HOST ||
  'localhost:8000';

export const PYTHON_WS_URL: string =
  Constants.expoConfig?.extra?.pythonWsUrl ||
  process.env.EXPO_PUBLIC_PYTHON_WS_URL ||
  `ws://${PYTHON_WS_HOST}`;


