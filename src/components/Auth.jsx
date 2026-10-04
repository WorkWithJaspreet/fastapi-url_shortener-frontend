import { useState } from "react";
import api from "../api/api";

function Auth({ onLogin }) {
  const [registerMode, setRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const endpoint = registerMode ? "/auth/register" : "/auth/login";
      const res = await api.post(endpoint, { email, password });

      localStorage.setItem("access_token", res.data.access_token);
      onLogin();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Request failed");
    }
  };

  return (
    <div className="auth-card">
      <h1>Developer URL Shortener</h1>
      <p className="muted">
        {registerMode ? "Create your account" : "Sign in to continue"}
      </p>

      <form onSubmit={submit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <input
          type="password"
          placeholder="Password (8+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          autoComplete="current-password"
          required
        />

        <button className="primary" type="submit">
          {registerMode ? "Register" : "Login"}
        </button>
      </form>

      {message && <div className="error">{message}</div>}

      <button
        className="link-button"
        onClick={() => {
          setRegisterMode(!registerMode);
          setMessage("");
        }}
      >
        {registerMode
          ? "Already have an account? Login"
          : "Need an account? Register"}
      </button>
    </div>
  );
}

export default Auth;
