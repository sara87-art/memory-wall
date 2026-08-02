import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StarField from "./components/StarField";
import "./App.css";

function App() {
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem("token"));

  const [username, setUsername] = useState(
    localStorage.getItem("username") || "",
  );

  const [page, setPage] = useState("login");

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    setUsername("");
    setIsAdmin(false);
  }

  return (
    <>
      <StarField />
      {isAdmin ? (
        <Home username={username} onLogout={logout} />
      ) : page === "login" ? (
        <Login
          onLogin={(name) => {
            setUsername(name);
            setIsAdmin(true);
          }}
          goToSignup={() => setPage("signup")}
        />
      ) : (
        <Signup goToLogin={() => setPage("login")} />
      )}
    </>
  );
}

export default App;
