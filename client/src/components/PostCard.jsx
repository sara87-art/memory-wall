import PostActions from "./PostActions";
import CommentSection from "./CommentSection";
function PostCard({
  post,
  index,
  addLike,
  deletePost,
  editIndex,
  editText,
  setEditText,
  startEdit,
  saveEdit,
  comment,
  setComment,
  addComment,
  addCommentLike,
  showAllComments,
  setShowAllComments,
  reply,
  setReply,
  addReply,
  replyIndex,
  setReplyIndex,
  editAuthor,
  setEditAuthor,
  showEditBox,
  setShowEditBox,
  sendEditRequest,
  suggestText,
  setSuggestText,
  approveEdit,
  rejectEdit,
  likeApprovedEdit,
}) {
  const username = localStorage.getItem("username");
const role = localStorage.getItem("role");

const canEdit =
  role === "admin" || post.username === username;
  const canManageEdits =
  role === "admin" || post.username === username;
  return (
    <div className="post">
      <img src={`http://localhost:5001${post.image}`} alt="" />

      {editIndex === index ? (
        <>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />

          <br />

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button onClick={saveEdit}>💾 حفظ</button>{" "}
            <button onClick={() => startEdit(null)}>❌ إلغاء</button>
          </div>
        </>
      ) : (
        <>
          <h4>👤 {post.username}</h4>
          <p>{post.text}</p>{" "}
          <div className="button-group">
           {canEdit && (
  <button onClick={() => startEdit(index)}>
    ✏️ تعديل
  </button>
)}{" "}
            <button
              onClick={() =>
                setShowEditBox((prev) => ({
                  ...prev,
                  [index]: !prev[index],
                }))
              }
            >
              📝 اقترح تعديل
            </button>
          </div>{" "}
          {showEditBox[index] && (
            <>
              <br />

              <div className="edit-request-box">
  <input
    type="text"
    placeholder="اسمك"
    value={editAuthor}
    onChange={(e) => setEditAuthor(e.target.value)}
  />

  <textarea
    placeholder="اكتب التعديل المقترح..."
    value={suggestText}
    onChange={(e) => setSuggestText(e.target.value)}
  />

  <button onClick={() => sendEditRequest(index)}>
    إرسال الطلب
  </button>
</div>
            </>
          )}
        </>
      )}

     <PostActions
  post={post}
  likes={post.likes}
  addLike={addLike}
  deletePost={deletePost}
/>
    {canManageEdits && post.pendingEdits?.length > 0 && (
        <>
          <h4>🕓 طلبات التعديل ({post.pendingEdits.length})</h4>{" "}
          {post.pendingEdits.map((edit) => (
            <div
              key={edit._id || edit.id}
              style={{
                background: "#29222b",
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <p>👤 {edit.author}</p>

              <p>{edit.text}</p>

              <button onClick={() => approveEdit(index, edit._id || edit.id)}>
                ✅ قبول
              </button>

              <button onClick={() => rejectEdit(index, edit._id || edit.id)}>
                ❌ رفض
              </button>
            </div>
          ))}
        </>
      )}
      {post.approvedEdits?.length > 0 && (
        <>
          <h4 style={{ color: "limegreen", padding: "10px" }}>
            ✨ التعديلات المعتمدة ({post.approvedEdits.length})
          </h4>{" "}
          {post.approvedEdits.map((edit) => (
            <div
              key={edit._id || edit.id}
              style={{
                background: "#46314d",
                border: "1px solid #18121a",
                borderRadius: "12px",
                padding: "15px",
                marginBottom: "12px",
              }}
            >
              <p>👤 {edit.author}</p>

              <p>{edit.text}</p>

              <button
                onClick={() => likeApprovedEdit(index, edit._id || edit.id)}
              >
                ❤️ {edit.likes}
              </button>
            </div>
          ))}
        </>
      )}
      <p>
        📅{" "}
        {post.createdAt
          ? new Date(post.createdAt).toLocaleDateString("ar-EG")
          : post.date}
      </p>

      <p>
        🕒{" "}
        {post.createdAt
          ? new Date(post.createdAt).toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : post.time}
      </p>

      <CommentSection
        post={post}
        index={index}
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
      />
      <hr />
    </div>
  );
}

export default PostCard;
