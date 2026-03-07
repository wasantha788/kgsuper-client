import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function VerifyEmail() {
  const [message, setMessage] = useState("Verifying...");
  const [status, setStatus] = useState("pending");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const id = searchParams.get("id");

    if (!token || !id) {
      setMessage("Invalid verification link.");
      setStatus("error");
      return;
    }

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-email?token=${token}&id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Verification failed");
        return res.json();
      })
      .then((data) => {
        // 1. Set the success state immediately
        setMessage(data.message);
        setStatus("success");

        // 2. Keep this success message for 20 seconds
        // This prevents the screen from flickering to 'error' due to double-runs
     
        setTimeout(() => {
          window.location.href = "https://kgsuper-client-production.up.railway.app/seller-request/login";
          console.log("10 seconds passed.");
        }, 10000);
      })
      .catch((err) => {
        // If it's already success, don't show the error immediately
        setStatus((prevStatus) => {
          if (prevStatus === "success") return "success"; 
          setMessage("Invalid or expired verification token.");
          return "error";
        });
      });
  }, [searchParams]);

  return (
    <div style={{ padding: "100px 20px", textAlign: "center", fontFamily: "sans-serif",fontSize: "2.5rem" }}>
      <h1>Email Verification</h1>
      
      {/* CASE 1: SUCCESS - STAYS FOR AT LEAST 20 SECONDS */}
      {status === "success" && (
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "6rem", color: "#28a745", fontWeight: "bold" }}>SUCCESS!</h2>
          <p style={{ fontSize: "3rem", color: "#555" }}>{message}</p>
        </div>
      )}

      {/* CASE 2: ERROR */}
      {status === "error" && (
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "5rem", color: "#dc3545", fontWeight: "bold" }}>FAILED</h2>
          <p style={{ fontSize: "2.5rem", color: "#555" }}>{message}</p>
          <p style={{ fontSize: "2.2rem" }}>Please request a new link.</p>
        </div>
      )}

      {/* CASE 3: PENDING */}
      {status === "pending" && (
        <p style={{ fontSize: "2rem", color: "#666" }}>{message}</p>
      )}
    </div>
  );


};