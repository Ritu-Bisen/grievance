import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

/* Pages */
import ComplaintUserDashboard from "./pages/ComplaintUserDashboard";
import ComplaintTypeSelection from "./pages/ComplaintTypeSelection";
import WarehouseDashboard from "./pages/Warehouse/WarehouseDashboard";

/*
  NOTE:
  - We are NOT handling login here now
  - We are ONLY focusing on Complaint User module
  - Warehouse module added for managing incoming complaints
*/

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme="light"
        duration={4000}
      />
      <Routes>

        {/* Complaint User Dashboard */}
        <Route
          path="/complaint-user/dashboard"
          element={<ComplaintUserDashboard />}
        />

        {/* Raise Complaint → Select Type Page */}
        <Route
          path="/complaint/select-type"
          element={<ComplaintTypeSelection />}
        />

        {/* Warehouse Dashboard */}
        <Route
          path="/warehouse/dashboard"
          element={<WarehouseDashboard />}
        />

        {/* Temporary default route */}
        <Route
          path="*"
          element={<ComplaintUserDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
