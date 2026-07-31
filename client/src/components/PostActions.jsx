function PostActions({ likes, addLike, deletePost, post }) {
  const username = localStorage.getItem("username");
const role = localStorage.getItem("role");

const canDelete =
  role === "admin" || post.username === username;
  return (
    <div>
      <p>❤️ {likes}</p>

     <div className="button-group">
  <button onClick={addLike}>
    ❤️ إعجاب
  </button>

 {canDelete && (
  <button onClick={deletePost}>
    🗑️ حذف
  </button>
)}
</div>
    </div>
  );
}

export default PostActions;