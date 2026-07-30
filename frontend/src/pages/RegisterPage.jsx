import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import "./Auth.css";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", organization: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth">
      <div className="auth__card">
        <span className="eyebrow auth__eyebrow">Get started</span>
        <h1>Create your NetGuard account</h1>
        <p className="auth__sub">Set up your organization and run your first authorized scan in minutes.</p>

        <form className="auth__form" onSubmit={handleSubmit}>
          {error && <div className="auth__error">{error}</div>}
          <div className="auth__row">
            <div className="auth__field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} placeholder="Jordan Lee" />
            </div>
            <div className="auth__field">
              <label htmlFor="organization">Organization</label>
              <input id="organization" name="organization" type="text" required value={form.organization} onChange={handleChange} placeholder="Acme Corp" />
            </div>
          </div>
          <div className="auth__field">
            <label htmlFor="email">Work email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@company.com" />
          </div>
          <div className="auth__field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} placeholder="At least 8 characters" />
          </div>
          <button className="btn btn-primary auth__submit" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"} {!loading && <FiArrowRight />}
          </button>
        </form>

        <div className="auth__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </section>
  );
}
