import { useState } from "react";

function Signup({ onSignup, goToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://memory-wall-rvkm.onrender.com/register", {
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

      if (!res.ok) {
        return alert(data.message);
      }

      alert("Account created successfully");

      goToLogin();
    } catch (error) {
      alert("حدث خطأ أثناء إنشاء الحساب");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Create Account</h2>

      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br /><br />

        <button type="submit">Create Account</button>
      </form>

      <br />

      <button onClick={goToLogin}>
        Back to Login
      </button>
    </div>
  );
}

export default Signup;