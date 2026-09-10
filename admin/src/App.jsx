import { BrowserRouter, Routes, Route } from "react-router-dom";
import MapView from "./MapView";
import Dash from "./Dash";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The main map page */}
        <Route path="/" element={<MapView />} />
        
        {/* The separate dashboard page */}
        <Route path="/dash" element={<Dash />} />
      </Routes>
    </BrowserRouter>
  );
}