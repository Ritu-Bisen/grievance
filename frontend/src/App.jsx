import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import WarehouseDashboard from "./pages/warehouse/WarehouseDashboard";
import ComplaintUserDashboard from "./pages/client/ComplaintUserDashboard";
import ComplaintTypeSelection from "./pages/client/ComplaintTypeSelection";
import ComplaintView from "./pages/client/ComplaintView";
import DispatchSample from "./pages/client/DispatchSample";
import WarehouseSampleReceived from "./pages/warehouse/WarehouseSampleReceived";

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

          {/* Warehouse Dashboard */}
          <Route
            path="/warehouse"
            element={<WarehouseDashboard />}
          />

          {/* Warehouse View / Action */}
          <Route
            path="/warehouse/view/:code"
            element={<ComplaintView mode="WAREHOUSE_VIEW" />}
          />

          <Route
            path="/warehouse/action/:code"
            element={<ComplaintView mode="WAREHOUSE_ACTION" />}
          />

          {/* Complaint User Dashboard */}
          <Route
            path="/complaint/dashboard"
            element={<ComplaintUserDashboard />}
          />

          <Route
            path="/complaint-user/dashboard"
            element={<Navigate to="/complaint/dashboard" replace />}
          />

          {/* Raise Complaint */}
          <Route
            path="/complaint/select-type"
            element={<ComplaintTypeSelection />}
          />

          {/* Facility View */}
          <Route
            path="/complaint/view/:code"
            element={<ComplaintView mode="FACILITY" />}
          />

          {/* Dispatch */}
          <Route
            path="/complaint/dispatch/:complaintCode"
            element={<DispatchSample />}
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<ComplaintUserDashboard />}
          />
          <Route
  path="/warehouse/sample-received/:code"
  element={<WarehouseSampleReceived />}
/>

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
