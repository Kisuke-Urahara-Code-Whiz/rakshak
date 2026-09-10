import { API_BASE_URL } from '@/configs/env';
import axios from 'axios';
import * as FileSystem from 'expo-file-system/legacy';

export function getFormattedDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const date = `${year}-${month}-${day}`;

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const time = `${hours}:${minutes}:${seconds}`;

  return { date, time, lastUpdatedAt: `${date} ${time}` };
}

export function getFileExtension(uri: string | null, defaultExt: string): string {
  if (!uri) return defaultExt.toUpperCase();
  const parts = uri.split('.');
  if (parts.length > 1) {
    const ext = parts.pop()?.split('?')[0]?.split('#')[0];
    if (ext && ext.length <= 5) return ext.toUpperCase();
  }
  return defaultExt.toUpperCase();
}

export function getMimeType(extension: string): string {
  switch (extension.toUpperCase()) {
    case 'PNG':
      return 'image/png';
    case 'JPG':
    case 'JPEG':
      return 'image/jpeg';
    case 'MP4':
      return 'video/mp4';
    case 'M4A':
      return 'audio/m4a';
    case 'AAC':
      return 'audio/aac';
    case 'MP3':
      return 'audio/mpeg';
    case 'WAV':
      return 'audio/wav';
    default:
      return 'application/octet-stream';
  }
}

export async function sendHeartbeat(number: string, lat: number, lon: number, lastUpdatedAt: string) {
  console.log('Sending heartbeat to URL:', `${API_BASE_URL}/sql/enter`);
  return axios.post(
    `${API_BASE_URL}/sql/enter`,
    { number: Number(number), lat, lon, lastUpdatedAt },
    {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    }
  );
}

export async function uploadMediaEvidence(
  fileUri: string,
  phoneNumber: string,
  fileType: string,
  coords: { latitude: number; longitude: number }
) {
  const { date, time } = getFormattedDateTime();
  const mimeType = getMimeType(fileType);

  return FileSystem.uploadAsync(`${API_BASE_URL}/media/upload`, fileUri, {
    fieldName: 'file',
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    mimeType,
    headers: { 'ngrok-skip-browser-warning': 'true' },
    parameters: {
      number: String(phoneNumber),
      fileType,
      date,
      lat: String(coords.latitude),
      lon: String(coords.longitude),
      time,
    },
  });
}