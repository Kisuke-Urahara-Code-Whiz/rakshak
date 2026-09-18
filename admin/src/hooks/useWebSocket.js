import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useWebSocket - Resilient WebSocket client hook
 * Handles connection lifecycle, auto-reconnect, status notifications, and message dispatch.
 */
export function useWebSocket({
  url,
  fallbackUrl,
  onMessage,
  onOpen,
  onClose,
  onError,
  autoReconnect = true,
  reconnectInterval = 5000,
  enabled = true,
}) {
  const [status, setStatus] = useState('CONNECTING'); // 'CONNECTING' | 'OPEN' | 'CLOSED' | 'ERROR'
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);

  const urls = useRef([url, fallbackUrl].filter(Boolean));
  urls.current = [url, fallbackUrl].filter(Boolean);
  const activeUrlIndexRef = useRef(0);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const connect = useCallback(() => {
    const candidates = urls.current;
    if (!candidates.length || !enabled) return;

    const currentUrl = candidates[activeUrlIndexRef.current % candidates.length];

    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch {}
    }

    try {
      setStatus('CONNECTING');
      const ws = new WebSocket(currentUrl);
      socketRef.current = ws;

      ws.onopen = (event) => {
        if (!isMountedRef.current) return;
        setStatus('OPEN');
        setError(null);
        if (onOpenRef.current) onOpenRef.current(event);
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const parsed = JSON.parse(event.data);
          setLastMessage(parsed);
          if (onMessageRef.current) {
            onMessageRef.current(parsed, event);
          }
        } catch {
          setLastMessage(event.data);
          if (onMessageRef.current) {
            onMessageRef.current(event.data, event);
          }
        }
      };

      ws.onerror = (event) => {
        if (!isMountedRef.current) return;
        setStatus('ERROR');
        setError(event);
        if (onErrorRef.current) onErrorRef.current(event);
      };

      ws.onclose = (event) => {
        if (!isMountedRef.current) return;
        setStatus('CLOSED');
        if (onCloseRef.current) onCloseRef.current(event);

        // Try next candidate URL on failure
        activeUrlIndexRef.current = (activeUrlIndexRef.current + 1) % candidates.length;

        if (autoReconnect && isMountedRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              connect();
            }
          }, reconnectInterval);
        }
      };
    } catch (err) {
      setStatus('ERROR');
      setError(err);
      activeUrlIndexRef.current = (activeUrlIndexRef.current + 1) % candidates.length;
      if (autoReconnect && isMountedRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
      }
    }
  }, [enabled, autoReconnect, reconnectInterval]);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch {}
      }
    };
  }, [connect]);

  const sendMessage = useCallback((data) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      socketRef.current.send(payload);
      return true;
    }
    return false;
  }, []);

  const reconnect = useCallback(() => {
    clearTimeout(reconnectTimeoutRef.current);
    connect();
  }, [connect]);

  return {
    status,
    isConnected: status === 'OPEN',
    lastMessage,
    error,
    sendMessage,
    reconnect,
  };
}

export default useWebSocket;
