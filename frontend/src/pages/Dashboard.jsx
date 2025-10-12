import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { isLoggedIn, getUser } from "../utils/auth";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Dashboard() {
  const [myItems, setMyItems] = useState([]);
  const user = getUser();

  useEffect(() => {
    if (!isLoggedIn()) return;
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await API.get("/items");
      setMyItems(res.data.filter(item => item.postedBy._id === user.id));
    } catch (err) {
      toast.error("Failed to fetch items");
    }
  };

  return (
    <div>
      <h3>My Items</h3>
      <div className="row">
        {myItems.length > 0 ? myItems.map(item => (
          <div className="col-md-4" key={item._id}>
            <div className="card mb-3 shadow">
              {item.imageUrl && <img src={`https://lost-found-mogm.onrender.com/${item.imageUrl}`} className="card-img-top" alt={item.title} />}
              <div className="card-body">
                <h5 className="card-title">{item.title}</h5>
                <p className="card-text text-truncate">{item.description}</p>
                <p className="card-text"><small className="text-muted">{item.status}</small></p>
                <Link to={`/item/${item._id}`} className="btn btn-primary btn-sm me-2">View</Link>
                <Link to={`/edit/${item._id}`} className="btn btn-warning btn-sm">Edit</Link>
              </div>
            </div>
          </div>
        )) : <p>No items found</p>}
      </div>
    </div>
  );
}
