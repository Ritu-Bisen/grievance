import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import WarehouseDashboard from "./pages/warehouse/WarehouseDashboard";
import ComplaintUserDashboard from "./pages/client/ComplaintUserDashboard";
import ComplaintTypeSelection from "./pages/client/ComplaintTypeSelection";
import ComplaintView from "./pages/client/ComplaintView";
import DispatchSample from "./pages/client/DispatchSample";

import "./App.css";

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />

      <BrowserRouter>
        <Routes>

          {/* Default Redirect */}
          <Route
            path="/"
            element={<Navigate to="/complaint/dashboard" replace />}
          />

          {/* Warehouse */}
          <Route
            path="/warehouse"
            element={<WarehouseDashboard />}
          />

          {/* Complaint User Dashboard */}
          <Route
            path="/complaint/dashboard"
            element={<ComplaintUserDashboard />}
          />

          {/* Optional Alias */}
          <Route
            path="/complaint-user/dashboard"
            element={<Navigate to="/complaint/dashboard" replace />}
          />

          {/* Raise Complaint */}
          <Route
            path="/complaint/select-type"
            element={<ComplaintTypeSelection />}
          />

          {/* View Complaint */}
          <Route
            path="/complaint/view/:code"
            element={<ComplaintView />}
          />

          {/* Dispatch */}
          <Route
            path="/complaint/dispatch/:complaintCode"
            element={<DispatchSample />}
          />

          {/* Fallback (404) */}
          <Route
            path="*"
            element={<ComplaintUserDashboard />}
          />

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
