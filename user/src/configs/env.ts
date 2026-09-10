import Constants from 'expo-constants';

const DEFAULT_NGROK_HOST = '7706-152-58-181-7.ngrok-free.app';

export const NGROK_HOST: string =
  Constants.expoConfig?.extra?.ngrokHost ??
  Constants.manifest2?.extra?.expoClient?.extra?.ngrokHost ??
  DEFAULT_NGROK_HOST;

export const API_BASE_URL = `https://${NGROK_HOST}`;
export const WS_BASE_URL = `wss://${NGROK_HOST}`;