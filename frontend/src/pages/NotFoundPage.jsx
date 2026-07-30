import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="section" style={{ textAlign: "center", padding: "120px 0" }}>
      <div className="container">
        <span className="eyebrow">404</span>
        <h2 style={{ margin: "12px 0 16px" }}>This host doesn't respond</h2>
        <p style={{ marginBottom: "24px" }}>The page you're looking for isn't on this network.</p>
        <Link to="/" className="btn btn-primary" style={{ display: "inline-flex" }}>Back to home</Link>
      </div>
    </section>
  );
}
