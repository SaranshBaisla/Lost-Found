import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../utils/api";
import ItemCard from "../components/ItemCard";
import "./Home.css";

export default function Home() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const location = useLocation();

  // Fetch all items once
  useEffect(() => {
    api.get("/items").then((res) => setItems(res.data));
  }, []);

  // Filter items whenever URL query changes or items are updated
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q")?.toLowerCase() || "";

    if (q) {
      const filtered = items.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [location.search, items]);

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section text-center">
        <h1 className="fw-bold hero-text">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="120"
            height="100"
            viewBox="0 0 64 64"
            fill="none"
          >
            <circle cx="27" cy="27" r="16" stroke="#00bfff" strokeWidth="7" />
            <line x1="40" y1="40" x2="50" y2="50" stroke="#00bfff" strokeWidth="7" strokeLinecap="round" />
            <rect x="22" y="22" width="10" height="10" fill="#ffcc00" stroke="#222" strokeWidth="1" />
            <path d="M45 15c3 0 5 2 5 5 0 4-5 10-5 10s-5-6-5-10c0-3 2-5 5-5z" fill="#ff4d4d"/>
            <circle cx="45" cy="20" r="2" fill="#fff"/>
          </svg>
          
          Lost & Found
        </h1>
        <p className="lead mb-0">
          Post your lost items or help others by reporting what you found.
        </p>
      </div>

      {/* Items Section */}
      <div className="container">
        <h2 className="fw-bold mb-4 text-center text-dark">Available Items</h2>

        {filteredItems.length === 0 ? (
          <div className="text-center text-muted">
            <p>No items found.</p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
            {filteredItems.map((item) => (
              <div key={item._id} className="col d-flex">
                <div className="flex-fill d-flex flex-column">
                  <ItemCard item={item} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
