import { useState } from "react";
import { login } from "../api";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("admin123");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const { login: doLogin } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const { accessToken } = await login(email, password);
      if (!accessToken) throw new Error("No access token received");
      doLogin(accessToken, remember);
    } catch (err) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        "Login gagal";
      setError(errorMsg);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-200 to-slate-300 flex items-center justify-center font-sans"
      style={{ fontFamily: "Inter, Arial, sans-serif" }}
    >
      <form
        onSubmit={handleLogin}
        className="w-[370px] bg-white rounded-2xl p-8 shadow-xl flex flex-col gap-4"
      >
        <h2 className="text-center font-extrabold text-3xl mb-3">Sign In</h2>
        <p className="text-center text-gray-500 mb-1">
          Just sign in if you have an account in here. Enjoy our Website
        </p>
        {error && (
          <div className="text-red-700 bg-red-100 rounded-md px-3 py-2 mb-2 text-center">
            {error}
          </div>
        )}

        <input
          id="login-email"
          type="email"
          value={email}
          autoComplete="username"
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Your Email / Username"
          className="w-full px-3 py-3 rounded-lg border-2 border-slate-300 focus:border-blue-700 outline-none text-base transition-colors"
          onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
        />

        <input
          id="login-password"
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter Password"
          className="w-full px-3 py-3 rounded-lg border-2 border-slate-300 focus:border-blue-700 outline-none text-base transition-colors"
          onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
        />

        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center text-sm space-x-2 select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-blue-600 cursor-pointer"
            />
            <span>Remember Me</span>
          </label>
          <a
            href="#"
            className="text-blue-700 text-sm hover:underline cursor-pointer"
          >
            Forgot Password
          </a>
        </div>

        <button
          type="submit"
          className="bg-blue-700 text-white font-semibold rounded-lg py-3 cursor-pointer shadow-md hover:bg-blue-800 transition-colors"
        >
          Login
        </button>

        <p className="text-center text-gray-500 text-sm mt-2">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-700 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
