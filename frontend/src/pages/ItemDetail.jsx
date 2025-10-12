import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./ItemDetail.css";

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "info", action: null });

  // Show toast
  const showToast = (msg, type = "info", action = null) => {
    setToast({ show: true, message: msg, type, action });
    setTimeout(() => setToast({ show: false, message: "", type: "info", action: null }), 4000);
  };

  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/items/${id}`);
        setItem(res.data);
      } catch (err) {
        console.error("Error fetching item:", err);
        showToast("Failed to load item details.", "danger");
      }
    };
    fetchItem();
  }, [id]);

  const token = localStorage.getItem("token");
  const isOwner =
    token &&
    item?.postedBy?._id === JSON.parse(atob(token.split(".")[1])).id;

  // Send message to owner
  const handleSendMessage = async () => {
    if (!message.trim()) return showToast("Please enter a message.", "warning");
    if (!token) return showToast("You must be logged in to send messages.", "warning");
    if (!item.postedBy?._id) return showToast("Item owner information is missing.", "danger");

    try {
      await api.post(
        "/messages",
        { itemId: item._id, recipientId: item.postedBy._id, text: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Message sent successfully!", "success");
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err.response?.data || err);
      showToast("Failed to send message.", "danger");
    }
  };

  // Delete item
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/items/${item._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Item deleted successfully!", "success");
      navigate("/");
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err);
      showToast(
        err.response?.data?.message || "Failed to delete item.",
        "danger"
      );
    }
  };

  // Mark as found
  const handleMarkFound = async () => {
    try {
      const res = await api.put(
        `/items/${item._id}/mark-found`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItem((prev) => ({ ...prev, ...res.data }));
      showToast("Item marked as found!", "success");
    } catch (err) {
      console.error("Mark as found failed:", err.response?.data || err);
      showToast(
        err.response?.data?.message || "Failed to update item.",
        "danger"
      );
    }
  };

  if (!item) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading item details...</p>
      </div>
    );
  }

  return (
    <div className="item-detail-container">
      <div className="detail-grid">
        {/* Item Card */}
        <div className="item-section">
          <div className="detail-card">
            {item.imageUrl ? (
              <div className="detail-image-container">
                {/* ✅ Use Cloudinary URL directly */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="detail-image"
                />
                <div className={`status-badge status-${item.status.toLowerCase()}`}>
                  {item.status}
                </div>
              </div>
            ) : (
              <div className="no-image">No Image</div>
            )}

            <div className="detail-content">
              <h1 className="detail-title">{item.title}</h1>
              <p className="detail-description">{item.description}</p>

              <div className="detail-info">
                <div className="info-item">
                  <span className="info-label">Posted by: </span>
                  <span className="info-value">{item.postedBy?.name || "Unknown"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status: </span>
                  <span className="info-value">{item.status}</span>
                </div>
                {item.location && (
                  <div className="info-item">
                    <span className="info-label">Location: </span>
                    <span className="info-value">{item.location}</span>
                  </div>
                )}
              </div>

              {isOwner && (
                <div className="owner-actions">
                  <button
                    className="action-btn btn-success"
                    onClick={handleMarkFound}
                    disabled={item.status === "Found"}
                  >
                    Mark as Found
                  </button>
                  <button
                    className="action-btn btn-warning"
                    onClick={() => navigate(`/edit-item/${item._id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="action-btn btn-danger"
                    onClick={() => showToast("Are you sure? Click DELETE to confirm.", "danger", handleDelete)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Form */}
        {!isOwner && (
          <div className="message-section">
            <div className="message-card">
              <h2 className="message-title">Contact Owner</h2>
              <p className="message-subtitle">
                Send a message to {item.postedBy?.name || "the owner"}
              </p>
              <div className="message-form">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="message-textarea"
                  placeholder="Type your message here..."
                  rows={5}
                />
                <button onClick={handleSendMessage} className="send-btn">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === "success" && "✓"}
              {toast.type === "danger" && "✕"}
              {toast.type === "warning" && "⚠"}
              {toast.type === "info" && "ℹ"}
            </span>
            <span className="toast-message">{toast.message}</span>
            {toast.action && (
              <button className="toast-action-btn" onClick={toast.action}>
                DELETE
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
