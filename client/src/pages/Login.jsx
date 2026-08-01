import { useState } from "react";

function Login({ onLogin, goToSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://memory-wall-rvkm.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();
      console.log("Status:", res.status);
      console.log("Response:", data);
      if (!res.ok) {
        return alert(data.message);
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      onLogin(data.username, data.role);
    } catch (error) {
      alert("حدث خطأ أثناء تسجيل الدخول");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Welcome Back</h2>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <br />

        <button type="submit">Login</button>
        <br />
        <br />

        <p>Don't have an account?</p>

        <button type="button" onClick={goToSignup}>
          Create Account
        </button>
      </form>
    </div>
  );
}

export default Login;
