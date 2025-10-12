import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./AddItem.css";

export default function AddItem() {
  const [form, setForm] = useState({ title: "", description: "", location: "" });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null); // { type: "success" | "error", message: "" }

  const navigate = useNavigate(); // ⬅️ added

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000); // hide after 3s
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.title || !form.description || !form.location) {
      return showNotification("error", "Please fill in all required fields.");
    }

    const token = localStorage.getItem("token");
    if (!token) return showNotification("error", "You must be logged in to post an item.");

    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (image) formData.append("image", image);

    try {
      setLoading(true);
      await api.post("/items", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      showNotification("success", "Item added successfully!");
      setForm({ title: "", description: "", location: "" });
      setImage(null);

      // ⬅️ Redirect to home page after a short delay (optional)
      setTimeout(() => navigate("/"), 1000);

    } catch (err) {
      console.error(err.response?.data || err);
      showNotification("error", "Failed to add item. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-item-wrapper">
      <form 
        className="card container mt-4 mb-5 p-4" 
        onSubmit={handleSubmit}
        style={{ maxWidth: "600px" }}
      >
        <h2 className="fw-bold mb-3">Post New Item</h2>

        <div className="mb-3">
          <input 
            name="title" 
            placeholder="Title" 
            className="form-control" 
            value={form.title}
            onChange={handleChange} 
          />
        </div>

        <div className="mb-3">
          <textarea 
            name="description" 
            placeholder="Description" 
            className="form-control" 
            value={form.description}
            onChange={handleChange} 
          />
        </div>

        <div className="mb-3">
          <input 
            name="location" 
            placeholder="Location" 
            className="form-control" 
            value={form.location}
            onChange={handleChange} 
          />
        </div>

        <div className="mb-3">
          <input 
            type="file" 
            className="form-control"
            onChange={e => setImage(e.target.files[0])} 
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-success w-100" 
          disabled={loading}
        >
          {loading ? "Posting..." : "Submit"}
        </button>
      </form>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}
