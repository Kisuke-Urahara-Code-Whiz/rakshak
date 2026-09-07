import { useAppStore } from '@/stores/useAppStore';
import { Client } from '@stomp/stompjs';
import { useEffect, useRef } from 'react';

const NGROK_HOST = process.env.EXPO_PUBLIC_NGROK_HOST ?? '7706-152-58-181-7.ngrok-free.app';
const WS_URL = `wss://${NGROK_HOST}/room/ws`;
const RISK_TOPIC = '/topic/risk';

export function useRiskWebSocket() {
  const { phoneNumber, setRiskScore } = useAppStore();
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!phoneNumber) return;

    const client = new Client({
      brokerURL: WS_URL,
      webSocketFactory: () => new WebSocket(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        'ngrok-skip-browser-warning': 'true',
        number: phoneNumber,
      },
      onConnect: () => {
        client.subscribe(RISK_TOPIC, (message) => {
          try {
            const body = JSON.parse(message.body);

            const rawPercentage =
              typeof body === 'object' && body !== null
                ? body.riskPercentage ?? body.riskScore ?? body.score
                : body;

            const parsedScore = parseFloat(String(rawPercentage));

            if (!isNaN(parsedScore)) {
              const clampedScore = Math.max(0, Math.min(100, Math.round(parsedScore)));
              setRiskScore(clampedScore);
            }
          } catch (e) {
            console.warn('Failed to parse STOMP risk message:', e);
          }
        });
      },
      onStompError: (frame) => {
        console.warn('STOMP Broker error:', frame.headers['message']);
      },
      onWebSocketClose: () => {
        console.log('STOMP connection closed, retrying automatically...');
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [phoneNumber]);
}