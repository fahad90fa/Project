import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import "./Auth.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data;
      const message =
        data?.message ||
        data?.errors?.[0]?.msg ||
        (err.response
          ? "Unable to sign in. Check your credentials."
          : "Cannot reach the server. Make sure the backend is running on port 5000.");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth">
      <div className="auth__card">
        <span className="eyebrow auth__eyebrow">Welcome back</span>
        <h1>Sign in to NetGuard</h1>
        <p className="auth__sub">Access your asset inventory, scan history, and risk dashboard.</p>

        <form className="auth__form" onSubmit={handleSubmit}>
          {error && <div className="auth__error">{error}</div>}
          <div className="auth__field">
            <label htmlFor="email">Work email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@company.com" />
          </div>
          <div className="auth__field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} placeholder="••••••••" />
          </div>
          <button className="btn btn-primary auth__submit" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"} {!loading && <FiArrowRight />}
          </button>
        </form>

        <div className="auth__footer">
          Don't have an account? <Link to="/register">Start a free scan</Link>
        </div>
      </div>
    </section>
  );
}
