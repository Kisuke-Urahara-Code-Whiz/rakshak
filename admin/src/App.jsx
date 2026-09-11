import { BrowserRouter, Routes, Route } from "react-router-dom";
import MapView from "./MapView";
import Dash from "./Dash";
import Login from "./Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The main map page */}
        <Route path="/" element={<MapView />} />
        <Route path="/login" element={<Login />} />
        
        {/* The separate dashboard page */}
        <Route path="/dash" element={<Dash />} />
      </Routes>
    </BrowserRouter>
  );
}