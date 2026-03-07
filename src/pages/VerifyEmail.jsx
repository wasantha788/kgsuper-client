import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const [message, setMessage] = useState("Verifying...");
  const [status, setStatus] = useState("pending");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Ref to ensure we only call the API once even in StrictMode
  const hasCalledApi = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");
    const id = searchParams.get("id");

    if (!token || !id) {
      setMessage("Invalid verification link.");
      setStatus("error");
      return;
    }

    // Prevent double execution in React Strict Mode
    if (hasCalledApi.current) return;
    hasCalledApi.current = true;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-email?token=${token}&id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Verification failed");
        return res.json();
      })
      .then((data) => {
        setMessage(data.message || "Email verified successfully!");
        setStatus("success");

        // Wait 3 seconds so the user sees the success message, then redirect
        setTimeout(() => {
          window.location.href = "https://kgsuper-client-production.up.railway.app/seller-request/login";
        }, 4000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage("Invalid or expired verification token.");
      });
  }, [searchParams]);

  return (
    <div style={{ padding: "100px 20px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>Email Verification</h1>
      
      {status === "success" && (
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "4rem", color: "#28a745", fontWeight: "bold" }}>SUCCESS!</h2>
          <p style={{ fontSize: "2rem", color: "#555" }}>{message}</p>
          <p style={{ fontSize: "1.2rem" }}>Redirecting you to login...</p>
        </div>
      )}

      {status === "error" && (
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "4rem", color: "#dc3545", fontWeight: "bold" }}>FAILED</h2>
          <p style={{ fontSize: "2rem", color: "#555" }}>{message}</p>
          <p style={{ fontSize: "1.5rem" }}>Please request a new link.</p>
        </div>
      )}

      {status === "pending" && (
        <p style={{ fontSize: "2rem", color: "#666" }}>{message}</p>
      )}
    </div>
  );
}