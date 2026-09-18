import { WS_BASE_URL } from '@/configs/env';
import { useAppStore } from '@/stores/useAppStore';
import { escalateOfficialAlert } from '@/services/telemetryApi';
import { Client } from '@stomp/stompjs';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

const WS_URL = `${WS_BASE_URL}/room/ws`;
const RISK_TOPIC = '/topic/risk';

// Extract python server host for direct python socket connection
function getPythonSocketUrl(clientId: string): string {
  try {
    let host = 'localhost:8000';
    if (WS_BASE_URL) {
      const match = WS_BASE_URL.match(/wss?:\/\/([^/:]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        host = `${match[1]}:8000`;
      }
    }
    if (Platform.OS === 'android' && host.startsWith('localhost')) {
      host = '10.0.2.2:8000';
    }
    return `ws://${host}/ws/front/${clientId}`;
  } catch {
    return `ws://localhost:8000/ws/front/${clientId}`;
  }
}

export function useRiskWebSocket() {
  const { phoneNumber, setRiskScore } = useAppStore();
  const clientRef = useRef<Client | null>(null);
  const pythonSocketRef = useRef<WebSocket | null>(null);
  const lastEscalatedRef = useRef<number>(0);

  // Helper to process risk updates from any socket (STOMP or Python WebSocket)
  const handleIncomingRiskScore = (rawScore: any, source: string) => {
    const parsedScore = parseFloat(String(rawScore));
    if (!isNaN(parsedScore)) {
      const clampedScore = Math.max(0, Math.min(100, Math.round(parsedScore)));
      console.log(`[${source}] Broadcaster updating risk score: ${clampedScore}%`);
      setRiskScore(clampedScore);

      // Requirement 4: When risk score is critical (>= 75%), drop an alert in /room/alert
      if (clampedScore >= 75) {
        const now = Date.now();
        if (now - lastEscalatedRef.current > 60000) {
          lastEscalatedRef.current = now;
          console.warn(`[${source}] Critical risk (${clampedScore}%). Dropping official alert into /room/alert for Unakoti Node 85`);
          escalateOfficialAlert({
            district: 'Unakoti',
            state: 'Tripura',
            latitude: 23.7548,
            longitude: 92.4273,
            riskScore: clampedScore,
            message: `CRITICAL TACTICAL ALERT: Severe landslide risk (${clampedScore}%) detected by IoT telemetry for Unakoti, Tripura (Node 85). Evacuation protocol active.`,
            kioskId: 'KIO-TR-085',
            kioskName: 'Unakoti ADM5-Node 85',
            employeeId: 'IOT-UNAKOTI-085',
            role: 'IoT Automated Station',
          }).catch((err) => {
            console.warn('[useRiskWebSocket] escalateOfficialAlert failed:', err?.message || err);
          });
        }
      }
    }
  };

  useEffect(() => {
    if (!phoneNumber) return;

    const clientId = `user_${phoneNumber.replace(/\D/g, '') || 'app'}`;

    // 1. Connect directly to Python FastAPI WebSocket (/ws/front/{client_id})
    const pythonWsUrl = getPythonSocketUrl(clientId);
    console.log('[Python WS] Connecting to:', pythonWsUrl);

    try {
      const pySocket = new WebSocket(pythonWsUrl);
      pythonSocketRef.current = pySocket;

      pySocket.onopen = () => {
        console.log('[Python WS] Connected to Python telemetry broadcaster socket');
        try {
          pySocket.send(
            JSON.stringify({
              type: 'INIT_QUERY',
              client_id: clientId,
              status: 'READY',
            })
          );
        } catch {}
      };

      pySocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'PING') {
            try {
              pySocket.send(JSON.stringify({ type: 'PONG', status: 'ALIVE' }));
            } catch {}
            return;
          }

          if (data.risk_percentage !== undefined) {
            handleIncomingRiskScore(data.risk_percentage, 'Python WS');
          } else if (data.risk !== undefined) {
            handleIncomingRiskScore(data.risk, 'Python WS');
          }
        } catch (e) {
          console.warn('[Python WS] Error parsing packet:', e);
        }
      };

      pySocket.onerror = (err) => {
        console.warn('[Python WS] Socket error on:', pythonWsUrl, err);
      };

      pySocket.onclose = () => {
        console.log('[Python WS] Disconnected from Python socket');
      };
    } catch (e) {
      console.warn('[Python WS] Init error:', e);
    }

    // 2. Connect to Room-Service STOMP WebSocket (/room/ws -> /topic/risk)
    console.log('[STOMP] Connecting to:', WS_URL);

    const client = new Client({
      debug: (str) => console.log('[STOMP DEBUG]', str),

      webSocketFactory: () => {
        console.log('[STOMP] Creating raw WebSocket to:', WS_URL);
        const socket = new (WebSocket as any)(WS_URL, [
          'v12.stomp',
          'v11.stomp',
          'v10.stomp',
        ]);

        return socket;
      },

      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        number: phoneNumber,
      },

      onConnect: (frame) => {
        console.log('[STOMP] onConnect fired, frame headers:', JSON.stringify(frame.headers));
        client.subscribe(RISK_TOPIC, (message) => {
          console.log('[STOMP] RAW MESSAGE on', RISK_TOPIC, ':', message.body);
          try {
            const body = JSON.parse(message.body);
            const rawPercentage =
              typeof body === 'object' && body !== null ? body.riskPercentage : body;
            handleIncomingRiskScore(rawPercentage, 'STOMP');
          } catch (e) {
            console.warn('[STOMP] Failed to parse risk message:', e);
          }
        });
        console.log('[STOMP] Subscribed to', RISK_TOPIC);
      },

      onDisconnect: (frame) => {
        console.log('[STOMP] onDisconnect fired:', JSON.stringify(frame.headers));
      },
      onStompError: (frame) => {
        console.error('[STOMP] Broker ERROR frame - message:', frame.headers['message']);
      },
      onWebSocketError: (event) => {
        console.error('[STOMP] onWebSocketError:', JSON.stringify(event));
      },
      onWebSocketClose: (event) => {
        console.log('[STOMP] onWebSocketClose - code:', event.code);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (pythonSocketRef.current) {
        try {
          pythonSocketRef.current.close();
        } catch {}
      }
      if (client.active) {
        client.deactivate();
      }
    };
  }, [phoneNumber, setRiskScore]);
}