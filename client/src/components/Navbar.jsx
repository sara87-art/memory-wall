import { useState } from "react";
import "./Navbar.css";

function Navbar({ username, onLogout, setCurrentPage }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <h2>Memory Wall</h2>

      <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <button
          onClick={() => {
            setCurrentPage("home");
            setMenuOpen(false);
          }}
        >
          🏠 الرئيسية
        </button>

        <img
          src={
            localStorage.getItem("avatar") ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt="avatar"
          className="navbar-avatar"
          style={{ cursor: "pointer" }}
          onClick={() => {
            setCurrentPage("profile");
            setMenuOpen(false);
          }}
        />

        <button
          onClick={() => {
            onLogout();
            setMenuOpen(false);
          }}
        >
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
