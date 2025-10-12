import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import './Navbar.css';
import logo from '../assets/bitmeerutofficial_logo.jpg';
import io from "socket.io-client";

// Connect to your deployed backend
const socket = io("https://lost-found-mogm.onrender.com");

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // Check auth whenever route changes
  useEffect(() => {
    checkAuth();
  }, [location]);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setIsAuthenticated(true);
        setUserName(decoded.name || decoded.email || "User");

        // Register socket for live updates
        socket.emit("register", decoded.id);

        // Listen for incoming messages
        socket.on("receiveMessage", (message) => {
          // Increment unread count only if not on inbox page
          if (!location.pathname.includes("/inbox")) {
            setUnreadCount((prev) => prev + 1);
          }
        });
      } catch (err) {
        setIsAuthenticated(false);
        setUserName("");
      }
    } else {
      setIsAuthenticated(false);
      setUserName("");
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?q=${query}`);
      setQuery(""); // clear the search bar after search
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUserName("");
    setShowUserMenu(false);
    setIsOpen(false);
    setUnreadCount(0);
    navigate("/login");
  };

  // Reset unread count when navigating to inbox
  useEffect(() => {
    if (location.pathname.includes("/inbox")) {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="BIT Logo" className="logo-img" />
      </Link>

      {/* Desktop Search Form */}
      <form className="search-form d-none d-md-flex" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search items..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {/* Desktop Links */}
      {isAuthenticated && (
        <div className="nav-links d-none d-md-flex">
          <Link className="nav-link flex items-center gap-1" to="/">
            {/* Home Icon */}
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="22" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z" clipRule="evenodd"/>
            </svg>
            <span style={{ lineHeight: 1 }}>Home</span>
          </Link>

          <Link className="nav-link flex items-center gap-1" to="/add">
            {/* Add Item Icon */}
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="22" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4.243a1 1 0 1 0-2 0V11H7.757a1 1 0 1 0 0 2H11v3.243a1 1 0 1 0 2 0V13h3.243a1 1 0 1 0 0-2H13V7.757Z" clipRule="evenodd"/>
            </svg>
            <span style={{ lineHeight: 1 }}>Add Item</span>
          </Link>

          <Link className="nav-link flex items-center gap-1 relative" to="/inbox">
            {/* Messages Icon */}
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="22" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M4 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1v2a1 1 0 0 0 1.707.707L9.414 13H15a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4Z" clipRule="evenodd"/>
              <path fillRule="evenodd" d="M8.023 17.215c.033-.03.066-.062.098-.094L10.243 15H15a3 3 0 0 0 3-3V8h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-1v2a1 1 0 0 1-1.707.707L14.586 18H9a1 1 0 0 1-.977-.785Z" clipRule="evenodd"/>
            </svg>
            <span style={{ lineHeight: 1 }}>Messages</span>

            {/* Unread Badge */}
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </Link>
        </div>
      )}

      {/* Auth Section */}
      <div className="navbar-right d-none d-md-flex">
        {isAuthenticated ? (
          <div className="user-menu-container">
            <button className="user-menu-button" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
              <span className="user-name">{userName}</span>
              <span className={`arrow-icon ${showUserMenu ? "rotate" : ""}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="user-avatar-large">{userName.charAt(0).toUpperCase()}</div>
                  <div className="user-info">
                    <div className="user-name-large">{userName}</div>
                    <div className="user-status">Active</div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item signout-item" onClick={handleSignOut}>Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link className="btn btn-outline" to="/login">Login</Link>
            <Link className="btn btn-primary" to="/register">Register</Link>
          </>
        )}
      </div>

      {/* Mobile Hamburger */}
      <div className="hamburger d-md-none" onClick={toggleMenu}>
        <div className={isOpen ? "active" : ""}></div>
        <div className={isOpen ? "active" : ""}></div>
        <div className={isOpen ? "active" : ""}></div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu d-md-none">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search items..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">🔍</button>
          </form>

          {isAuthenticated ? (
            <>
              <div className="mobile-user-info">
                <div className="user-avatar-large">{userName.charAt(0).toUpperCase()}</div>
                <span className="user-name-large">{userName}</span>
              </div>
              <Link className="mobile-link" to="/" onClick={toggleMenu}>Home</Link>
              <Link className="mobile-link" to="/add" onClick={toggleMenu}>Add Item</Link>
              <Link className="mobile-link" to="/inbox" onClick={toggleMenu}>Messages</Link>
              <button className="mobile-link signout-link" onClick={handleSignOut}>Sign Out</button>
            </>
          ) : (
            <>
              <Link className="mobile-link" to="/" onClick={toggleMenu}>Home</Link>
              <Link className="mobile-link" to="/login" onClick={toggleMenu}>Login</Link>
              <Link className="mobile-link" to="/register" onClick={toggleMenu}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
