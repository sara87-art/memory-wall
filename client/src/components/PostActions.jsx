function PostActions({ likes, addLike, deletePost }) {
  const isAdmin = !!localStorage.getItem("token");
  return (
    <div>
      <p>❤️ {likes}</p>

     <div className="button-group">
  <button onClick={addLike}>
    ❤️ إعجاب
  </button>

  {isAdmin && (
  <button onClick={deletePost}>
    🗑️ حذف
  </button>
)}
</div>
    </div>
  );
}

export default PostActions;