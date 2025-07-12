import { useState } from "react";
import { register } from "../api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password and Confirm Password do not match");
      return;
    }

    setLoading(true);

    function getErrorMessage(error: unknown): string {
      if (error instanceof Error) return error.message;

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
      ) {
        return (error as { response: { data: { message: string } } }).response.data.message;
      }

      return "Registration failed";
    }

    try {
      await register(email, fullName, password);
      navigate("/login");
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-200 to-slate-300 flex items-center justify-center font-sans"
      style={{ fontFamily: "Inter, Arial, sans-serif" }}
    >
      <form
        onSubmit={handleRegister}
        className="w-[370px] bg-white rounded-2xl p-8 shadow-xl flex flex-col gap-4"
      >
        <h2 className="text-center font-extrabold text-3xl mb-3 text-blue-900">Register</h2>

        {error && (
          <div className="text-red-700 bg-red-100 rounded-md px-3 py-2 mb-2 text-center">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-3 rounded-lg border-2 border-slate-300 focus:border-blue-700 outline-none text-base transition-colors"
          onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
        />

        <input
          type="text"
          placeholder="Full Name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3 py-3 rounded-lg border-2 border-slate-300 focus:border-blue-700 outline-none text-base transition-colors"
          onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-3 rounded-lg border-2 border-slate-300 focus:border-blue-700 outline-none text-base transition-colors"
          onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-3 rounded-lg border-2 border-slate-300 focus:border-blue-700 outline-none text-base transition-colors"
          onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-700 text-white font-semibold rounded-lg py-3 cursor-pointer shadow-md hover:bg-blue-800 transition-colors disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center text-gray-500 text-sm mt-2">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-700 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
