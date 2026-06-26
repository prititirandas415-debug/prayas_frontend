import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StartRescue from './pages/StartRescue';
import RescueHistory from './pages/RescueHistory';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rescue"    element={<StartRescue />} />
        <Route path="/history"   element={<RescueHistory />} />
        <Route path="*"          element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
