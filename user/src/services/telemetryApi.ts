import { API_BASE_URL } from '@/configs/env';
import axios from 'axios';
import { Platform } from 'react-native';
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
      return 'audio/mp4';
    case 'AAC':
      return 'audio/aac';
    case 'MP3':
      return 'audio/mpeg';
    case 'WAV':
      return 'audio/wav';
    case 'WEBM':
      return 'audio/webm';
    default:
      return 'application/octet-stream';
  }
}

export async function loginAuth(
  role: string,
  identifier: string,
  password?: string,
  latitude?: number,
  longitude?: number
) {
  return axios.post(
    `${API_BASE_URL}/sql/auth/login`,
    {
      role,
      identifier,
      password,
      latitude,
      longitude,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      timeout: 5000,
    }
  );
}

export async function sendHeartbeat(
  number: string,
  lat: number,
  lon: number,
  lastUpdatedAt: string
) {
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

export async function updateCitizenLanguage(
  phoneNumber: string,
  lang: string,
  userType: 'NEW' | 'OLD'
) {
  return axios.put(
    `${API_BASE_URL}/sql/citizen/language`,
    {
      number: Number(phoneNumber),
      lang,
      userType,
    },
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
  coords: { latitude: number; longitude: number },
  questionnaire?: any
) {
  const { date, time } = getFormattedDateTime();
  const mimeType = getMimeType(fileType);
  const normalizedExt = fileType.toLowerCase();
  const fileName = `upload_${Date.now()}.${normalizedExt}`;

  // Native Android & iOS: Use native FileSystem.uploadAsync to bypass React Native's FormData bug
  if (Platform.OS !== 'web') {
    console.log(API_BASE_URL, 'Uploading media evidence (Native FileSystem):', fileName, 'Type:', mimeType, 'URI:', fileUri);

    const qStr = questionnaire
      ? typeof questionnaire === 'string'
        ? questionnaire
        : JSON.stringify(questionnaire)
      : undefined;

    const uploadResult = await FileSystem.uploadAsync(
      `${API_BASE_URL}/media/upload`,
      fileUri,
      {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        mimeType: mimeType,
        parameters: {
          number: String(phoneNumber),
          fileType: fileType,
          date: date,
          time: time,
          lat: String(coords.latitude),
          lon: String(coords.longitude),
          ...(qStr ? { questionnaire: qStr } : {}),
        },
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      }
    );

    if (uploadResult.status < 200 || uploadResult.status >= 300) {
      throw new Error(`Upload failed with status ${uploadResult.status}: ${uploadResult.body || 'Server error'}`);
    }

    return { status: uploadResult.status, ok: true };
  }

  // Web environment: Standard browser FormData + Blob
  const formData = new FormData();
  try {
    const res = await fetch(fileUri);
    const blob = await res.blob();
    formData.append('file', blob, fileName);
  } catch (fetchErr) {
    console.warn('Web blob fetch fallback:', fetchErr);
    formData.append('file', {
      uri: fileUri,
      type: mimeType,
      name: fileName,
    } as any);
  }

  formData.append('number', String(phoneNumber));
  formData.append('fileType', fileType);
  formData.append('date', date);
  formData.append('time', time);
  formData.append('lat', String(coords.latitude));
  formData.append('lon', String(coords.longitude));
  if (questionnaire) {
    formData.append(
      'questionnaire',
      typeof questionnaire === 'string' ? questionnaire : JSON.stringify(questionnaire)
    );
  }

  console.log(API_BASE_URL, 'Uploading media evidence (Web FormData):', fileName, 'Type:', mimeType);

  const res = await fetch(`${API_BASE_URL}/media/upload`, {
    method: 'POST',
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Upload failed with status ${res.status}: ${errorText || res.statusText}`);
  }

  return { status: res.status, ok: res.ok };
}

export async function escalateOfficialAlert(payload: {
  employeeId?: string | null;
  role?: string | null;
  userName?: string | null;
  department?: string | null;
  kioskId?: string;
  kioskName?: string;
  district?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  message?: string;
  riskScore?: number;
}) {
  return axios.post(`${API_BASE_URL}/room/alert`, payload, {
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    timeout: 5000,
  });
}