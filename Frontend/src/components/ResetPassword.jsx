import React, { useState } from "react";

const ResetPassword = () => {
  const [email, setEmail] = useState(""); 
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://node-task3-password-reset.onrender.com/auth/reset-password/ojr00gkiuy", 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      console.log("Backend response:", data);

      if (!response.ok) {
        setError(data.message || "Failed to send reset link. Please try again.");
        setLoading(false);
        return;
      }

      setMessage("Reset link has been sent to your email successfully!");
      setEmail("");

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error sending reset link:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 bg-white rounded shadow-md"
      >
        <h2 className="mb-4 text-xl italic font-bold font-poppins">
          Send Reset Link
        </h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        {error && (
          <div className="p-2 mb-4 text-sm text-red-500 bg-red-100 rounded">
            {error}
          </div>
        )}
        {message && (
          <div className="p-2 mb-4 text-sm text-green-500 bg-green-100 rounded">
            {message}
          </div>
        )}
        <button
          type="submit"
          className="w-full px-4 py-2 italic text-white bg-blue-500 rounded hover:bg-blue-600 font-poppins"
          disabled={loading}
        >
          {loading ? "Sending Reset Link..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
