import { useState } from "react";

function Signup({ onSignup, goToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
const [message, setMessage] = useState("");
const [messageType, setMessageType] = useState("");
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "https://memory-wall-rvkm.onrender.com/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        },
      );

      const data = await res.json();
      console.log("Register status:", res.status);
      console.log("Register response:", data);
    if (!res.ok) {
  setMessage(data.message);
  setMessageType("error");
  return;
}

setMessage("تم إنشاء الحساب بنجاح ");
setMessageType("success");

setTimeout(() => {
  goToLogin();
}, 1500);
    } catch (error) {
  setMessage("حدث خطأ أثناء إنشاء الحساب");
  setMessageType("error");
}
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Create Account</h2>

      <form onSubmit={handleSignup}
      >
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

        <button type="submit">Create Account</button>
        {message && (
  <p className={`message ${messageType}`}>
    {message}
  </p>
)}
      </form>

      <br />

      <button onClick={goToLogin}>Back to Login</button>
    </div>
  );
}

export default Signup;
