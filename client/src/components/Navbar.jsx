import "./Navbar.css";

function Navbar({ username, onLogout, setCurrentPage }) {
  return (
    <nav className="navbar">
      <h2> Memory Wall</h2>

      <div className="nav-links">
        <button onClick={() => setCurrentPage("home")}>
          🏠 الرئيسية
        </button>

    <img
  src={
    localStorage.getItem("avatar") ||
    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  }
  alt="avatar"
  className="navbar-avatar"
  onClick={() => setCurrentPage("profile")}
  style={{ cursor: "pointer" }}
/>



        <button onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;