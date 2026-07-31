import { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import PostForm from "../components/PostForm";
function Home({ onLogout }) {
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
  //useEffect(() => {
  //localStorage.setItem("posts", JSON.stringify(posts));
  //}, [posts]);
  useEffect(() => {
    async function getPosts() {
      const response = await fetch("http://localhost:5001/posts");
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
      const response = await fetch("http://localhost:5001/posts", {
        method: "POST",
        body: formData,
      });

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
      `http://localhost:5001/posts/${post._id || post.id}/like`,
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

    const response = await fetch(`http://localhost:5001/posts/${post._id || post.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      const newPosts = posts.filter((_, i) => i !== index);
      setPosts(newPosts);
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

    const response = await fetch(`http://localhost:5001/posts/${post._id || post.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: editText,
      }),
    });

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
      `http://localhost:5001/posts/${post._id || post.id}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: comment,
        }),
      },
    );

    if (response.ok) {
      const newComment = await response.json();

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
      `http://localhost:5001/posts/${post._id || post.id}/comments/${comment._id || comment.id}/like`,
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
      `http://localhost:5001/posts/${post._id|| post.id}/comments/${comment._id || comment.id}/replies`,
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
      `http://localhost:5001/posts/${post._id || post.id}/edit-request`,
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
      const refreshed = await fetch("http://localhost:5001/posts");
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
      `http://localhost:5001/posts/${post._id || post.id}/edit-request/${editId}/approve`,
    {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
}
    );

    if (response.ok) {
      const refreshed = await fetch("http://localhost:5001/posts");
      const data = await refreshed.json();
      setPosts(data);
    }
  }
  async function rejectEdit(postIndex, editId) {
    const post = posts[postIndex];

    const response = await fetch(
      `http://localhost:5001/posts/${post._id || post.id}/edit-request/${editId}`,
     {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
}
    );

    if (response.ok) {
      const refreshed = await fetch("http://localhost:5001/posts");
      const data = await refreshed.json();
      setPosts(data);
    }
  }
  async function likeApprovedEdit(postIndex, editId) {
    const post = posts[postIndex];

    const response = await fetch(
      `http://localhost:5001/posts/${post._id || post.id}/approved-edits/${editId}/like`,
      {
        method: "PATCH",
      },
    );

    if (response.ok) {
      const refreshed = await fetch("http://localhost:5001/posts");
      const data = await refreshed.json();

      setPosts(data);
    }
  }
  return (
    <>
    <button
  onClick={onLogout}
  style={{
    position: "fixed",
    top: "20px",
    left: "20px",
    padding: "10px 18px",
    cursor: "pointer",
    zIndex: 999,
  }}
>
  Logout
</button>
      <div className="container">
        <h1>Memory Wall</h1>
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
    </>
  );
}

export default Home;
