import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
// import './Form.css';

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // helper for showing toast
  const showToast = (msg, type = "info") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);

      showToast("✅ Logged in successfully!", "success");
      setTimeout(() => navigate("/"), 1200); // redirect after toast
    } catch (err) {
      console.error(err.response?.data || err);
      showToast("❌ Login failed. Check your credentials.", "danger");
    }
  };

  return (
    <div className="card shadow p-3" style={{ maxWidth: "400px", margin: "auto" }}>
      <form
        className="mb-3 card shadow-sm"
        onSubmit={handleSubmit}
        style={{ padding: 20 }}
      >
        <h2 className="fw-bold">Login</h2>
        <input
          className="form-control mb-2"
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-3"
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`toast show position-fixed bottom-0 end-0 m-3 text-white bg-${toast.type}`}
          role="alert"
        >
          <div className="toast-body">{toast.message}</div>
        </div>
      )}
    </div>
  );
}
