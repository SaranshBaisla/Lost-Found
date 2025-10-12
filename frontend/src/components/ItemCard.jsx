import { useNavigate } from "react-router-dom";
import "./ItemCard.css";

export default function ItemCard({ item }) {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/item/${item._id}`);
  };

  const formattedDate = new Date(item.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const imageSrc = item.imageUrl || null; // ✅ Cloudinary URL is already complete

  return (
    <div className="item-card">
      {imageSrc ? (
        <img src={imageSrc} alt={item.title || "Item"} />
      ) : (
        <div className="no-image">No Image</div>
      )}

      <div className="item-card-content">
        <h3>{item.title || "No title"}</h3>
        <p>{item.description || "No description available"}</p>

        <p>
          <small>Status: {item.status || "Unknown"}</small>
        </p>
        <p className="posted-by">
          <small>Posted by: {item.postedBy?.name || "Unknown"}</small>
        </p>
        <p>
          <small>Date: {formattedDate || "Unknown"}</small>
        </p>
      </div>

      <div className="item-card-actions">
        <button onClick={handleView}>View Details</button>
      </div>
    </div>
  );
}
