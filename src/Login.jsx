import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { isLoggedIn } from "./auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/dashboard", { replace: true });
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.post("https://job-tracker-backend-6bt5.onrender.com/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>

        <input
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border border-gray-300 p-3 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
          onClick={handleLogin}
        >
          Login
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
