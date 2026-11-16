import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Shield, Lock, Mail } from "lucide-react";
import api from "../api/axiosConfig";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const successMessage = location.state?.message;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      const token = response.data;

      if (typeof token !== "string" || !token.trim()) {
        throw new Error("Invalid login response from server.");
      }

      sessionStorage.setItem("token", token.trim());

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Invalid email or password."
          : err.message || "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl">

        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-xl">
            <Shield size={30} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center">
          API Sentinel
        </h1>

        <p className="text-gray-500 text-sm text-center mt-2 mb-8">
          Sign in to your security dashboard
        </p>

        {successMessage && (
          <p className="text-green-400 text-sm mb-5 text-center">
            {successMessage}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="text-sm text-gray-300">
              Email Address
            </label>

            <div className="flex items-center gap-3 bg-[#1B1B1B] border border-white/10 rounded-lg px-3 mt-2">
              <Mail size={18} className="text-gray-500" />

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent py-3 outline-none text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300">
              Password
            </label>

            <div className="flex items-center gap-3 bg-[#1B1B1B] border border-white/10 rounded-lg px-3 mt-2">
              <Lock size={18} className="text-gray-500" />

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-transparent py-3 outline-none text-white text-sm"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg py-3 font-semibold transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <p className="text-sm text-gray-400 text-center mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Create Account
          </Link>
        </p>

        <p className="text-xs text-gray-600 text-center mt-6">
          Protected by API Sentinel Enterprise
        </p>

      </div>
    </div>
  );
}

export default Login;
