/**
 * Application Environment Configuration
 * Centralized access to environment variables configured in .env
 */

export const ENV = {
  // WebSocket URL for live kiosk & hazard alerts (room-service raw WebSocket)
  WS_ALERT_URL: import.meta.env.VITE_WS_ALERT_URL || 'ws://localhost:5004/ws/alerts',

  // Backend REST API Base URL for incident uploads, auth, and reports (Spring Cloud Gateway)
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',

  // WebSocket automatic reconnection backoff interval (ms)
  WS_RECONNECT_INTERVAL: Number(import.meta.env.VITE_WS_RECONNECT_INTERVAL) || 5000,

  // Enable mock simulation fallback if WebSocket backend is unreachable
  ENABLE_MOCK_FALLBACK: import.meta.env.VITE_ENABLE_MOCK_FALLBACK !== 'false',

  // Environment mode
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};

export default ENV;
