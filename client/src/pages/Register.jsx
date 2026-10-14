import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = "Full name is required.";
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!emailRegex.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.customMessage || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-slate-900/90 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Create an Account
          </h2>
          <p className="text-xs text-slate-400">
            Join GitInsight to start auditing GitHub repositories with AI and
            static analysis.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name)
                    setFieldErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Anshul Sharma"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border ${
                  fieldErrors.name
                    ? "border-rose-500/80 focus:border-rose-500"
                    : "border-slate-800 focus:border-indigo-500"
                } rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition`}
              />
            </div>
            {fieldErrors.name && (
              <p className="mt-1 text-[11px] text-rose-400">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email)
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="ada@example.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border ${
                  fieldErrors.email
                    ? "border-rose-500/80 focus:border-rose-500"
                    : "border-slate-800 focus:border-indigo-500"
                } rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition`}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-[11px] text-rose-400">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password (Min. 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password)
                    setFieldErrors((prev) => ({ ...prev, password: "" }));
                }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border ${
                  fieldErrors.password
                    ? "border-rose-500/80 focus:border-rose-500"
                    : "border-slate-800 focus:border-indigo-500"
                } rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition`}
              />
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-[11px] text-rose-400">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword)
                    setFieldErrors((prev) => ({
                      ...prev,
                      confirmPassword: "",
                    }));
                }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border ${
                  fieldErrors.confirmPassword
                    ? "border-rose-500/80 focus:border-rose-500"
                    : "border-slate-800 focus:border-indigo-500"
                } rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition`}
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-[11px] text-rose-400">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 transition shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Register & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
