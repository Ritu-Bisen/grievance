import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import WarehouseDashboard from './pages/warehouse/WarehouseDashboard';
import ComplaintTypeSelection from './pages/client/ComplaintTypeSelection';
import ComplaintUserDashboard from './pages/client/ComplainDashboard';
import './App.css';

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/complaint/dashboard" replace />} />
          <Route path="/complaint/dashboard" element={<ComplaintUserDashboard />} />
          <Route path="/warehouse" element={<WarehouseDashboard />} />
          <Route path="/complaint/select-type" element={<ComplaintTypeSelection />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
