import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GovHeader from "../components/GovHeader";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      const data = res.data;

      // 🔐 save token + role
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // ✅ save COMPLETE user object (VERY IMPORTANT)
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

      // 🚦 role-based redirect
      if (data.role === "WAREHOUSE") {
        navigate("/warehouse");
      } else if (data.role === "FACILITY") {
        navigate("/complaint/dashboard");
      } else if (data.role === "QC") {
        navigate("/qc/dashboard");
      } else if (data.role === "ADMIN") {
        navigate("/admin/dashboard");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ HEADER */}
      <GovHeader />

      {/* ✅ LOGIN FORM */}
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
