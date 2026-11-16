import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, User, Mail, Lock } from "lucide-react";
import api from "../api/axiosConfig";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      navigate("/login", {
        state: {
          message: "Account created successfully. You can now sign in.",
        },
      });
    } catch (err) {
      if (err.response?.status === 409) {
        setError("An account with this email already exists.");
      } else if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
          "Please check your details and try again."
        );
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to connect to server."
        );
      }
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
          Create Account
        </h1>

        <p className="text-gray-500 text-sm text-center mt-2 mb-8">
          Join API Sentinel Enterprise
        </p>

        <form onSubmit={handleRegister} className="space-y-5">

          <div>
            <label className="text-sm text-gray-300">
              Full Name
            </label>

            <div className="flex items-center gap-3 bg-[#1B1B1B] border border-white/10 rounded-lg px-3 mt-2">
              <User size={18} className="text-gray-500" />

              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-transparent py-3 outline-none text-white text-sm"
              />
            </div>
          </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full bg-transparent py-3 outline-none text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300">
              Confirm Password
            </label>

            <div className="flex items-center gap-3 bg-[#1B1B1B] border border-white/10 rounded-lg px-3 mt-2">
              <Lock size={18} className="text-gray-500" />

              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
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
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        <p className="text-sm text-gray-400 text-center mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Sign In
          </Link>
        </p>

        <p className="text-xs text-gray-600 text-center mt-6">
          New registrations receive standard USER access.
        </p>

      </div>
    </div>
  );
}

export default Register;
