import { WS_BASE_URL } from '@/configs/env';
import { useAppStore } from '@/stores/useAppStore';
import { Client } from '@stomp/stompjs';
import { useEffect, useRef } from 'react';

const WS_URL = `${WS_BASE_URL}/room/ws`;
const RISK_TOPIC = '/topic/risk';

export function useRiskWebSocket() {
  const { phoneNumber, setRiskScore } = useAppStore();
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!phoneNumber) return;

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

        socket.onopen = () => console.log('[RAW WS] onopen fired, protocol negotiated:', socket.protocol);
        socket.onerror = (e: any) => console.log('[RAW WS] onerror:', JSON.stringify(e));
        socket.onclose = (e: any) =>
          console.log('[RAW WS] onclose - code:', e.code, 'reason:', e.reason, 'wasClean:', e.wasClean);
        socket.onmessage = (e: any) =>
          console.log('[RAW WS] onmessage RAW:', JSON.stringify(e.data));

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

      beforeConnect: () => {
        console.log('[STOMP] beforeConnect fired');
      },

      onConnect: (frame) => {
        console.log('[STOMP] onConnect fired, frame headers:', JSON.stringify(frame.headers));
        client.subscribe(RISK_TOPIC, (message) => {
          console.log('[STOMP] RAW MESSAGE on', RISK_TOPIC, ':', message.body);
          try {
            const body = JSON.parse(message.body);
            const rawPercentage =
              typeof body === 'object' && body !== null ? body.riskPercentage : body;

            const parsedScore = parseFloat(String(rawPercentage));

            if (!isNaN(parsedScore)) {
              const clampedScore = Math.max(0, Math.min(100, Math.round(parsedScore)));
              console.log(`[STOMP] Updating risk score: ${clampedScore}%`);
              setRiskScore(clampedScore);
            } else {
              console.warn('[STOMP] parsedScore is NaN, rawPercentage was:', rawPercentage);
            }
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
        console.error('[STOMP] Broker ERROR body:', frame.body);
      },
      onWebSocketError: (event) => {
        console.error('[STOMP] onWebSocketError:', JSON.stringify(event));
      },
      onWebSocketClose: (event) => {
        console.log('[STOMP] onWebSocketClose - code:', event.code, 'reason:', event.reason);
      },
      onUnhandledFrame: (frame) => {
        console.warn('[STOMP] UNHANDLED FRAME:', frame.command, JSON.stringify(frame.headers), frame.body);
      },
      onUnhandledMessage: (message) => {
        console.warn('[STOMP] UNHANDLED MESSAGE:', message.headers, message.body);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [phoneNumber, setRiskScore]);
}