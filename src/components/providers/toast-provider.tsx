"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1A1A2E",
          color: "#FFFFFF",
          borderRadius: "8px",
          fontSize: "14px",
          padding: "12px 16px",
        },
        success: {
          iconTheme: { primary: "#27AE60", secondary: "#FFFFFF" },
        },
        error: {
          iconTheme: { primary: "#EB5757", secondary: "#FFFFFF" },
        },
      }}
    />
  );
}
