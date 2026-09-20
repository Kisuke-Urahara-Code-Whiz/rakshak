/**
 * Application Environment Configuration
 * Centralized access to environment variables configured in .env
 */

export const ENV = {
  // WebSocket URL for live risk & alerts (Port 8000 Python WebSocket server)
  WS_ALERT_URL: import.meta.env.VITE_WS_ALERT_URL || `${import.meta.env.VITE_PYTHON_WS_URL || 'ws://localhost:8000'}/ws/front/front_alerts`,

  // Backend REST API Base URL for incident uploads, auth, and reports (Spring Cloud Gateway)
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',

  // Risk service base URL (routed via Gateway)
  RISK_API_URL: import.meta.env.VITE_RISK_API_URL || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/risk`,

  // Python Telemetry & Risk WebSocket URL (serves /ws/front/{client_id})
  PYTHON_WS_URL: import.meta.env.VITE_PYTHON_WS_URL || 'ws://localhost:8000',

  // IoT Sensor & ESP Node WebSocket URL (serves /ws/soil/{device_id} and /ws/esp/{device_id})
  IOT_WS_URL: import.meta.env.VITE_IOT_WS_URL || import.meta.env.VITE_PYTHON_WS_URL || 'ws://localhost:8000',

  // WebSocket automatic reconnection backoff interval (ms)
  WS_RECONNECT_INTERVAL: Number(import.meta.env.VITE_WS_RECONNECT_INTERVAL) || 5000,

  // Enable mock simulation fallback if WebSocket backend is unreachable
  ENABLE_MOCK_FALLBACK: import.meta.env.VITE_ENABLE_MOCK_FALLBACK !== 'false',

  // Environment mode
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};

export default ENV;
