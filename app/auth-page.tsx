"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Head from "next/head";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email: formData.email.toLowerCase(),
      password: formData.password,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    if (result?.error) {
      setError("Invalid credentials");
    } else {
      setShowSuccess(true);
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email.toLowerCase(),
        password: formData.password,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      window.location.href = "/";
    } else {
      setError(data.error || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Login | TheMarketStories</title>
      </Head>
      {/* Success Modal with Backdrop Blur */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center max-w-xs w-full">
            <svg className="w-16 h-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-xl font-semibold mb-2 text-center">Login Successful!</h2>
            <p className="text-gray-600 mb-6 text-center">You have been logged in successfully.</p>
            <button
              className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-900 transition"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-100 py-6">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 flex overflow-hidden">
          {/* Left Panel: Form */}
          <div className="flex-1 p-8 flex flex-col justify-center">
            <p className="text-sm text-gray-600 mb-4">
            {mode === "login"
              ? "Accessing this course requires a login."
              : "Create your account below."}
          </p>
          <button
            type="button"
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-800 py-2.5 rounded-md text-sm hover:bg-gray-50 transition mb-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </button>
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>
          <form
            onSubmit={mode === "login" ? handleLogin : handleRegister}
            className="space-y-3 min-h-60"
          >
            {mode === "register" && (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm"
                required
              />
            )}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address"
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm"
              required
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm"
              required
            />
            {mode === "register" && (
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm"
                required
              />
            )}
            {mode === "login" && (
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" className="rounded border-gray-300" />
                Remember Me
              </label>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-md text-sm font-medium hover:bg-gray-900 disabled:opacity-60"
            >
              {mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>
        </div>
        {/* Right Panel: Illustration */}
        <div className="hidden md:flex flex-col items-center justify-center bg-black text-white p-8 w-96">
          <img
            src="/logos/login-illustration.svg"
            alt="Login/Register Illustration"
            className="mb-6 w-48 h-48 object-contain"
          />
          <h3 className="text-lg font-semibold mb-2">
            {mode === "login" ? "Register" : "Login"}
          </h3>
          <p className="text-sm text-gray-300 mb-4 text-center">
            {mode === "login"
              ? "Don't have an account? Register one!"
              : "Already have an account? Sign in!"}
          </p>
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="bg-white text-black px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-200 whitespace-nowrap"
          >
            {mode === "login" ? "Register an Account" : "Log In"}
          </button>
        </div>
      </div>
	</div>
    </>
  );
}
