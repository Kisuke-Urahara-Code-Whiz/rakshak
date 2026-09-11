import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MapView from "./MapView";
import Dash from "./Dash";
import Login from "./Login";
import Uploads from "./Uploads";
import { UploadsProvider } from "./UploadsContext";

export default function App() {
  return (
    <BrowserRouter>
      <UploadsProvider>
        <Routes>
          {/* Root path is the Login page */}
          <Route path="/" element={<Login />} />
          {/* Alias /login back to root */}
          <Route path="/login" element={<Navigate to="/" replace />} />

          {/* MapView reached after successful authentication */}
          <Route path="/map" element={<MapView />} />

          {/* Telemetry dashboard */}
          <Route path="/dash" element={<Dash />} />

          {/* Incident uploads viewer */}
          <Route path="/uploads" element={<Uploads />} />
        </Routes>
      </UploadsProvider>
    </BrowserRouter>
  );
}