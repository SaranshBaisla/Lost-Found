import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { toast } from "react-toastify";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/register", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Registered successfully");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="card shadow p-3" style={{ maxWidth: "400px", margin: "auto" }}>
      <h3 className="fw-bold">Register</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          
          <input className="form-control" type="text" placeholder="Name" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          
          <input className="form-control" type="email" placeholder="Email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          
          <input className="form-control" type="password" placeholder="Password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <button className="btn btn-primary w-100" type="submit">Register</button>
      </form>
    </div>
  );
}
