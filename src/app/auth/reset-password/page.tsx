"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Lock, AlertCircle, CheckCircle2, Building2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    toast.success("Password updated successfully!");

    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
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
      <div
        className="animate-fade-in"
        style={{ width: "100%", maxWidth: "420px" }}
      >
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
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
            }}
          >
            Set New Password
          </h1>
          <p style={{ fontSize: "14px", color: "#8B8BA7" }}>
            Choose a strong password for your account
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
          {success ? (
            <div className="animate-fade-in" style={{ textAlign: "center", padding: "12px 0" }}>
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
                <CheckCircle2 size={22} color="#27AE60" />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#FFFFFF", marginBottom: "8px" }}>
                Password Updated
              </h3>
              <p style={{ fontSize: "13px", color: "#8B8BA7" }}>
                Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="new-password"
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
                  New Password
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
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
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

              <div style={{ marginBottom: "24px" }}>
                <label
                  htmlFor="confirm-password"
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
                  Confirm Password
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
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
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
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
