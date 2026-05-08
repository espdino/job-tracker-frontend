import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { isLoggedIn } from "./auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/dashboard", { replace: true });
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post("https://job-tracker-backend-nxre.onrender.com/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>
        <input
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          className="w-full border border-gray-300 p-3 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          disabled={loading}
        />
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>
        <p className="text-center mt-4 text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500 hover:underline font-medium"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}