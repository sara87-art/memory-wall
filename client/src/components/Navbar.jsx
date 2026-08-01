import "./Navbar.css";

function Navbar({ username, onLogout, setCurrentPage }) {
  return (
    <nav className="navbar">
      <h2> Memory Wall</h2>

      <div className="nav-links">
        <button onClick={() => setCurrentPage("home")}>
          🏠 الرئيسية
        </button>

        <button onClick={() => setCurrentPage("profile")}>
          👤 {username}
        </button>

        <button onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;