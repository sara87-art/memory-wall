import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import StarField from "./components/StarField";
import "./App.css";

function App() {
 const [isAdmin, setIsAdmin] = useState(
  
  !!localStorage.getItem("token")
);
function logout() {
  localStorage.removeItem("token");
  setIsAdmin(false);
}

  return (
    <>
      <StarField />
      {isAdmin ? (
      <Home onLogout={logout} />
      ) : (
        <Login onLogin={() => setIsAdmin(true)} />
      )}
    </>
  );
}

export default App;