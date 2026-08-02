import { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import PostForm from "../components/PostForm";
import Navbar from "../components/Navbar";
function Home({ onLogout, username }) {
  const [comment, setComment] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [showAllComments, setShowAllComments] = useState([]);
  const [reply, setReply] = useState("");
  const [replyIndex, setReplyIndex] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editAuthor, setEditAuthor] = useState("");
  const [suggestText, setSuggestText] = useState("");
  const [showEditBox, setShowEditBox] = useState({});
  const [currentPage, setCurrentPage] = useState("home");
  const [avatar, setAvatar] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  //useEffect(() => {
  //localStorage.setItem("posts", JSON.stringify(posts));
  //}, [posts]);
  useEffect(() => {
    async function getPosts() {
      const response = await fetch(
        "https://memory-wall-rvkm.onrender.com/posts",
      );
      const data = await response.json();
      console.log(data);
      console.log(data[0]);
      console.log(data[0]?._id);
      setPosts(data);
    }

    getPosts();
  }, []);
  async function addPost() {
    if (!text) return;

    const formData = new FormData();
    formData.append("text", text);

    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch(
        "https://memory-wall-rvkm.onrender.com/posts",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        },
      );

      console.log("Status:", response.status);

      const result = await response.text();
      console.log("Response:", result);

      if (!response.ok) {
        alert("فشل إرسال المنشور");
        return;
      }

      const savedPost = JSON.parse(result);

      setPosts((prevPosts) => [...prevPosts, savedPost]);

      setText("");
      setImage(null);
    } catch (error) {
      console.error(error);
    }
  }
  async function addLike(index) {
    const post = posts[index];

    const response = await fetch(
      `https://memory-wall-rvkm.onrender.com/posts/${post._id || post.id}/like`,
      {
        method: "PATCH",
      },
    );

    if (response.ok) {
      const updatedPost = await response.json();

      const newPosts = [...posts];
      newPosts[index] = updatedPost;

      setPosts(newPosts);
    }
  }
  async function deletePost(index) {
    const post = posts[index];

    const token = localStorage.getItem("token");

    const response = await fetch(
      `https://memory-wall-rvkm.onrender.com/posts/${post._id || post.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.ok) {
      const newPosts = posts.filter((_, i) => i !== index);
      setPosts(newPosts);
    } else {
      const data = await response.json();
      alert(data.message);
    }
  }
  function startEdit(index) {
    if (index === null) {
      setEditIndex(null);
      setEditText("");
      return;
    }

    setEditIndex(index);
    setEditText(posts[index].text);
  }
  async function saveEdit() {
    const post = posts[editIndex];

    const response = await fetch(
      `https://memory-wall-rvkm.onrender.com/posts/${post._id || post.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          text: editText,
        }),
      },
    );

    if (!response.ok) {
      const data = await response.json();
      alert(data.message);
      return;
    }

    const updatedPost = await response.json();

    const newPosts = [...posts];
    newPosts[editIndex] = updatedPost;

    setPosts(newPosts);

    setEditIndex(null);
    setEditText("");
  }
  async function addComment(index) {
    if (!comment.trim()) return;

    const post = posts[index];

    const response = await fetch(
      `https://memory-wall-rvkm.onrender.com/posts/${post._id || post.id}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          text: comment,
        }),
      },
    );

    if (response.ok) {
      const newComment = await response.json();
      console.log("NEW COMMENT =", newComment);
      console.log("COMMENT AVATAR =", newComment.avatar);
      console.log("COMMENT USERNAME =", newComment.username);
      const newPosts = [...posts];
      newPosts[index].comments.push(newComment);

      setPosts(newPosts);
      setComment("");
    }
  }
  async function addCommentLike(postIndex, commentIndex) {
    const post = posts[postIndex];
    const comment = post.comments[commentIndex];

    const response = await fetch(
      `https://memory-wall-rvkm.onrender.com/posts/${post._id || post.id}/comments/${comment._id || comment.id}/like`,
      {
        method: "PATCH",
      },
    );

    if (response.ok) {
      const updatedComment = await response.json();

      const newPosts = [...posts];
      newPosts[postIndex].comments[commentIndex] = updatedComment;

      setPosts(newPosts);
    }
  }
  async function addReply(postIndex, commentIndex) {
    if (!reply.trim()) return;

    const post = posts[postIndex];
    const comment = post.comments[commentIndex];

    const response = await fetch(
      `https://memory-wall-rvkm.onrender.com/posts/${post._id || post.id}/comments/${comment._id || comment.id}/replies`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: reply,
        }),
      },
    );

    if (response.ok) {
      const newReply = await response.json();

      const newPosts = [...posts];
      newPosts[postIndex].comments[commentIndex].replies.push(newReply);

      setPosts(newPosts);
      setReply("");
    }
  }
  async function sendEditRequest(postIndex) {
    const post = posts[postIndex];

    if (!suggestText.trim() || !editAuthor.trim()) return;

    const response = await fetch(
      `https://memory-wall-rvkm.onrender.com/posts/${post._id || post.id}/edit-request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author: editAuthor,
          text: suggestText,
        }),
      },
    );

    if (response.ok) {
      const refreshed = await fetch(
        "https://memory-wall-rvkm.onrender.com/posts",
      );
      const data = await refreshed.json();
      setPosts(data);

      setSuggestText("");
      setEditAuthor("");

      setShowEditBox((prev) => ({
        ...prev,
        [postIndex]: false,
      }));
    }
  }
  async function approveEdit(postIndex, editId) {
    const post = posts[postIndex];

    const response = await fetch(
      `https://memory-wall-rvkm.onrender.com/posts/${post._id || post.id}/edit-request/${editId}/approve`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    if (response.ok) {
      const refreshed = await fetch(
        "https://memory-wall-rvkm.onrender.com/posts",
      );
      const data = await refreshed.json();
      setPosts(data);
    }
  }
  async function rejectEdit(postIndex, editId) {
    const post = posts[postIndex];

    const response = await fetch(
      `https://memory-wall-rvkm.onrender.com/posts/${post._id || post.id}/edit-request/${editId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    if (response.ok) {
      const refreshed = await fetch(
        "https://memory-wall-rvkm.onrender.com/posts",
      );
      const data = await refreshed.json();
      setPosts(data);
    }
  }
  async function likeApprovedEdit(postIndex, editId) {
    const post = posts[postIndex];

    const response = await fetch(
      `https://memory-wall-rvkm.onrender.com/posts/${post._id || post.id}/approved-edits/${editId}/like`,
      {
        method: "PATCH",
      },
    );

    if (response.ok) {
      const refreshed = await fetch(
        "https://memory-wall-rvkm.onrender.com/posts",
      );
      const data = await refreshed.json();

      setPosts(data);
    }
  }
  async function uploadAvatar() {
    if (!avatar) return;

    const formData = new FormData();
    formData.append("avatar", avatar);

    const response = await fetch(
      "https://memory-wall-rvkm.onrender.com/users/avatar",
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return alert(data.message);
    }

    localStorage.setItem("avatar", data.avatar);

    localStorage.setItem("avatar", data.avatar);

    window.location.reload();
  }
  async function changeUsername() {
    const response = await fetch(
      "https://memory-wall-rvkm.onrender.com/users/username",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          username: newUsername,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return alert(data.message);
    }

    localStorage.setItem("username", data.username);

    alert("تم تغيير الاسم");

    window.location.reload();
  }
  return (
    <>
      <Navbar
        username={username}
        onLogout={onLogout}
        setCurrentPage={setCurrentPage}
      />
      {currentPage === "home" && (
        <div className="container">
          <PostForm
            text={text}
            setText={setText}
            setImage={setImage}
            addPost={addPost}
          />

          <hr />

          <h3>المنشورات</h3>
          {posts.filter(Boolean).map((post, index) => (
            <PostCard
              key={post._id || post.id}
              index={index}
              post={post}
              addLike={() => addLike(index)}
              deletePost={() => deletePost(index)}
              editIndex={editIndex}
              editText={editText}
              setEditText={setEditText}
              startEdit={startEdit}
              saveEdit={saveEdit}
              comment={comment}
              setComment={setComment}
              addComment={addComment}
              addCommentLike={addCommentLike}
              showAllComments={showAllComments}
              setShowAllComments={setShowAllComments}
              reply={reply}
              setReply={setReply}
              addReply={addReply}
              replyIndex={replyIndex}
              setReplyIndex={setReplyIndex}
              editAuthor={editAuthor}
              setEditAuthor={setEditAuthor}
              showEditBox={showEditBox}
              setShowEditBox={setShowEditBox}
              sendEditRequest={sendEditRequest}
              suggestText={suggestText}
              setSuggestText={setSuggestText}
              approveEdit={approveEdit}
              rejectEdit={rejectEdit}
              likeApprovedEdit={likeApprovedEdit}
            />
          ))}
        </div>
      )}

      {currentPage === "profile" && (
        <div className="profile-page">
          <input type="file" onChange={(e) => setAvatar(e.target.files[0])} />
          <br />
           <br />
<button onClick={uploadAvatar}>
  📷 تغيير الصورة الشخصية
</button>
          <br />
           <br />
      <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    marginBottom: "25px",
  }}
>
  <img
    src={
      localStorage.getItem("avatar") ||
      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    }
    alt="avatar"
    style={{
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "4px solid #fff",
      marginBottom: "10px",
    }}
  />

 
</div>

 <h2>{localStorage.getItem("username")}</h2>
         

          <br />
          <input
            type="text"
            placeholder="اسم المستخدم الجديد"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />

          <br />
          <br />

          <button onClick={changeUsername}>✏️ تغيير اسم المستخدم</button>

          <hr />

          <h3>📚 منشوراتي</h3>

          {posts
            .filter((post) => post.username === username)
            .map((post) => (
              <div key={post._id} className="my-post">
                {post.image && (
                  <img
                    src={post.image}
                    alt=""
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      marginBottom: "10px",
                    }}
                  />
                )}

                <p>{post.text}</p>

                <p>❤️ {post.likes}</p>
              </div>
            ))}
          <p>
            📝 عدد منشوراتي:{" "}
            {posts.filter((post) => post.username === username).length}
          </p>

          <p>
            ❤️ مجموع الإعجابات:{" "}
            {posts
              .filter((post) => post.username === username)
              .reduce((sum, post) => sum + post.likes, 0)}
          </p>
        </div>
      )}
    </>
  );
}

export default Home;
