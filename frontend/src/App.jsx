import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import WarehouseDashboard from "./pages/warehouse/WarehouseDashboard";
import ComplaintUserDashboard from "./pages/client/ComplaintUserDashboard";
import ComplaintTypeSelection from "./pages/client/ComplaintTypeSelection";
import ComplaintView from "./pages/client/ComplaintView";
import DispatchSample from "./pages/client/DispatchSample";

import WarehouseSampleReceived from "./pages/warehouse/WarehouseSampleReceived";
import WarehouseApproveReject from "./pages/warehouse/WarehouseApproveReject";
import WarehouseActionRedirect from "./pages/warehouse/WarehouseActionRedirect";

import PhysicalAssessmentPage from "./pages/warehouse/PhysicalAssessmentPage";
import ADRAssessmentPage from "./pages/warehouse/ADRAssessmentPage";
import QualityAssessmentPage from "./pages/warehouse/QualityAssessmentPage";
import WarehouseAssessmentView from
  "./pages/warehouse/WarehouseAssessmentView";


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

          {/* Warehouse View */}
          <Route
            path="/warehouse/view/:code"
            element={<ComplaintView mode="WAREHOUSE_VIEW" />}
          />

          {/* 🔥 Warehouse Action (TYPE DECIDER ONLY) */}
          <Route
            path="/warehouse/action/:code"
            element={<WarehouseActionRedirect />}
          />

          {/* 🔥 Sample Received */}
          <Route
            path="/warehouse/sample-received/:code"
            element={<WarehouseSampleReceived />}
          />

          {/* 🔥 Approve / Reject */}
          <Route
            path="/warehouse/approve-reject/:code"
            element={<WarehouseApproveReject />}
          />

          {/* 🔥 Assessment Pages */}
          <Route
            path="/warehouse/action/physical/:code"
            element={<PhysicalAssessmentPage />}
          />
          <Route
            path="/warehouse/action/adr/:code"
            element={<ADRAssessmentPage />}
          />
          <Route
            path="/warehouse/action/quality/:code"
            element={<QualityAssessmentPage />}
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
            path="/warehouse/assessment/view/:code"
            element={<WarehouseAssessmentView />}
          />


        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
