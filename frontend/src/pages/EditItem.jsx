// src/pages/EditItem.js
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
// import './Form.css';

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    status: "Lost",
    location: "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const showToast = (msg, type = "info") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/items/${id}`);
        setItem(res.data);
        setForm({
          title: res.data.title,
          description: res.data.description,
          category: res.data.category,
          status: res.data.status,
          location: res.data.location,
        });
      } catch (err) {
        console.error("Error fetching item:", err);
        showToast("Failed to load item.", "danger");
      }
    };
    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return showToast("You must be logged in.", "warning");

    try {
      setLoading(true);
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));
      if (image) formData.append("image", image);

      await api.put(`/items/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      showToast("Item updated successfully!", "success");
      navigate(`/item/${id}`);
    } catch (err) {
      console.error("Update failed:", err.response?.data || err);
      showToast(err.response?.data?.message || "Failed to update item.", "danger");
    } finally {
      setLoading(false);
    }
  };

  if (!item) return <p>Loading...</p>;

  return (
    <div className="container mt-4 mb-5">
      <div className="card p-4 mx-auto" style={{ maxWidth: "600px" }}>
        <h2 className="fw-bold mb-3 text-center">Edit Item</h2>

        <div className="mb-3">
          <input
            className="form-control"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <textarea
            className="form-control"
            name="description"
            placeholder="Description"
            rows={4}
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <select
            className="form-select"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>
        </div>

        <div className="mb-3">
          <input
            className="form-control"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <input
            type="file"
            className="form-control"
            onChange={handleImageChange}
          />
        </div>

        <button
          type="submit"
          className="btn btn-success w-100"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {/* Toast */}
        {toast.show && (
          <div
            className={`toast show position-fixed bottom-0 end-0 m-3 text-white bg-${toast.type}`}
            role="alert"
          >
            <div className="toast-body">{toast.message}</div>
          </div>
        )}
      </div>
    </div>
  );
}
