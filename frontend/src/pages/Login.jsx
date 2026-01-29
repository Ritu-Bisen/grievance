import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoginHeader from "../components/LoginHeader";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔒 If already logged in, do not show login page
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      if (role === "WAREHOUSE") navigate("/warehouse", { replace: true });
      else if (role === "FACILITY") navigate("/complaint/dashboard", { replace: true });
      else if (role === "QC") navigate("/qc/dashboard", { replace: true });
      else if (role === "ADMIN") navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      const data = res.data;

      // 🔐 save auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      localStorage.setItem(
        "user",
        JSON.stringify({
          role: data.role,
          email: email,
          facility_name: data.facility_name || null,
          facility_address: data.facility_address || null,
          warehouse_code: data.warehouse_code || null,
        })
      );

      // 🚦 redirect WITH history replace (IMPORTANT)
      if (data.role === "WAREHOUSE") {
        navigate("/warehouse", { replace: true });
      } else if (data.role === "FACILITY") {
        navigate("/complaint/dashboard", { replace: true });
      } else if (data.role === "QC") {
        navigate("/qc/dashboard", { replace: true });
      } else if (data.role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      }

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <LoginHeader />

      <div className="flex items-center justify-center mt-10">
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 rounded shadow w-96"
        >
          <h2 className="text-xl font-semibold mb-4 text-center">
            Login
          </h2>

          {error && (
            <p className="text-red-600 text-sm mb-3 text-center">
              {error}
            </p>
          )}

          <input
            type="email"
            placeholder="Email"
            className="border w-full p-2 mb-3 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="border w-full p-2 mb-4 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
