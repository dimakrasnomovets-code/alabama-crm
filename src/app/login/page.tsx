export const dynamic = "force-dynamic";

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [resetSent, setResetSent] = useState(false);

  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    toast.success("Welcome back!");
    window.location.href = "/";
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: email.split('@')[0],
          role: 'admin', // First user is usually admin for testing
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    toast.success("Account created! You can now sign in.");
    setMode("login");
    setLoading(false);
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setResetSent(true);
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 50%, #12121F 100%)",
        padding: "20px",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "20%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(74,144,217,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "20%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <div
        className="animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "420px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo / Branding */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #4A90D9, #7C3AED)",
              marginBottom: "16px",
              boxShadow: "0 8px 32px rgba(74,144,217,0.3)",
            }}
          >
            <Building2 size={28} color="#FFFFFF" />
          </div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#FFFFFF",
              marginBottom: "6px",
              letterSpacing: "-0.02em",
            }}
          >
            Alabama Foreclosure CRM
          </h1>
          <p style={{ fontSize: "14px", color: "#8B8BA7" }}>
            {mode === "login"
              ? "Sign in to your account"
              : mode === "signup"
              ? "Create a new account"
              : "Reset your password"}
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(26, 26, 46, 0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
          }}
        >
          {mode === "login" || mode === "signup" ? (
            <form onSubmit={mode === 'signup' ? handleSignUp : handleLogin}>
              {/* Email */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#8B8BA7",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={16}
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#8B8BA7",
                    }}
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    style={{
                      width: "100%",
                      height: "44px",
                      paddingLeft: "42px",
                      paddingRight: "14px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#FFFFFF",
                      fontSize: "14px",
                      outline: "none",
                      transition: "border-color 150ms, box-shadow 150ms",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#4A90D9";
                      e.target.style.boxShadow = "0 0 0 3px rgba(74,144,217,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.1)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#8B8BA7",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={16}
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#8B8BA7",
                    }}
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    style={{
                      width: "100%",
                      height: "44px",
                      paddingLeft: "42px",
                      paddingRight: "44px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#FFFFFF",
                      fontSize: "14px",
                      outline: "none",
                      transition: "border-color 150ms, box-shadow 150ms",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#4A90D9";
                      e.target.style.boxShadow = "0 0 0 3px rgba(74,144,217,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.1)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#8B8BA7",
                      padding: "4px",
                      display: "flex",
                    }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="animate-fade-in"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "rgba(235,87,87,0.1)",
                    border: "1px solid rgba(235,87,87,0.2)",
                    color: "#EB5757",
                    fontSize: "13px",
                    marginBottom: "20px",
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: loading
                    ? "rgba(74,144,217,0.5)"
                    : "linear-gradient(135deg, #4A90D9, #5A9FE6)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 150ms",
                  boxShadow: loading ? "none" : "0 4px 12px rgba(74,144,217,0.3)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.target as HTMLElement).style.boxShadow =
                      "0 6px 20px rgba(74,144,217,0.4)";
                    (e.target as HTMLElement).style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.boxShadow =
                    "0 4px 12px rgba(74,144,217,0.3)";
                  (e.target as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                {loading ? (
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#FFFFFF",
                      borderRadius: "50%",
                      animation: "spin 0.6s linear infinite",
                    }}
                  />
                ) : (
                  <>
                    {mode === 'signup' ? 'Create Account' : 'Sign In'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Toggle Signup/Login */}
              <div style={{ textAlign: "center", marginTop: "24px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: "13px", color: "#8B8BA7" }}>
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'login' ? 'signup' : 'login');
                      setError(null);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#4A90D9",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>

              {/* Forgot password link */}
              {mode === 'login' && (
                <div style={{ textAlign: "center", marginTop: "16px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#4A90D9",
                      fontSize: "13px",
                      opacity: 0.7,
                      cursor: "pointer",
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPassword}>
              {resetSent ? (
                <div
                  className="animate-fade-in"
                  style={{ textAlign: "center", padding: "12px 0" }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "rgba(39,174,96,0.12)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <Mail size={22} color="#27AE60" />
                  </div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#FFFFFF",
                      marginBottom: "8px",
                    }}
                  >
                    Check your email
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#8B8BA7",
                      lineHeight: 1.6,
                    }}
                  >
                    We sent a password reset link to{" "}
                    <span style={{ color: "#FFFFFF" }}>{email}</span>
                  </p>
                </div>
              ) : (
                <>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#8B8BA7",
                      marginBottom: "20px",
                      lineHeight: 1.6,
                    }}
                  >
                    Enter your email address and we&apos;ll send you a link to
                    reset your password.
                  </p>

                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ position: "relative" }}>
                      <Mail
                        size={16}
                        style={{
                          position: "absolute",
                          left: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#8B8BA7",
                        }}
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                        style={{
                          width: "100%",
                          height: "44px",
                          paddingLeft: "42px",
                          paddingRight: "14px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "10px",
                          color: "#FFFFFF",
                          fontSize: "14px",
                          outline: "none",
                          transition: "border-color 150ms, box-shadow 150ms",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#4A90D9";
                          e.target.style.boxShadow =
                            "0 0 0 3px rgba(74,144,217,0.15)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "rgba(255,255,255,0.1)";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>

                  {error && (
                    <div
                      className="animate-fade-in"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "rgba(235,87,87,0.1)",
                        border: "1px solid rgba(235,87,87,0.2)",
                        color: "#EB5757",
                        fontSize: "13px",
                        marginBottom: "20px",
                      }}
                    >
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%",
                      height: "44px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      background: loading
                        ? "rgba(74,144,217,0.5)"
                        : "linear-gradient(135deg, #4A90D9, #5A9FE6)",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: "all 150ms",
                      boxShadow: "0 4px 12px rgba(74,144,217,0.3)",
                    }}
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </>
              )}

              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                    setResetSent(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#4A90D9",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  ← Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "12px",
            color: "#4A4A6A",
          }}
        >
          Foreclosure lead pipeline management
        </p>
      </div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
