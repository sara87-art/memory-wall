function CommentSection({
  post,
  index,
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
}) {
  return (
    <>
      <p>💬 {post.comments?.length || 0}</p>
      <div className="comment-input">
        <input
          type="text"
          placeholder="...اكتب تعليق"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />{" "}
        <button onClick={() => addComment(index)}>💬 إضافة تعليق</button>
      </div>{" "}
      {(showAllComments[index]
        ? (post.comments ?? [])
        : (post.comments ?? []).slice(0, 1)
      ).map((item, i) => (
        <div className="comment" key={item._id || item.id || i}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <img
              src={
                item.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="avatar"
              style={{
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />

            <div>
              <strong>{item.username}</strong>
              <p style={{ margin: 0 }}>💬 {item.text}</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => addCommentLike(index, i)}>
              ❤️ {item.likes}
            </button>

            <button onClick={() => setReplyIndex(i)}>💬 رد</button>
          </div>
          {replyIndex === i && (
            <>
              <div className="reply-box">
                <input
                  type="text"
                  placeholder="اكتب رد..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />{" "}
                <button onClick={() => addReply(index, i)}>📤 إرسال</button>
              </div>
            </>
          )}
          {(item.replies ?? []).map((replyItem, j) => (
            <div
              key={replyItem._id || replyItem.id || j}
              className="reply"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginLeft: "25px",
                marginTop: "10px",
              }}
            >
              <img
                src={
                  replyItem.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="avatar"
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />

              <div>
                <strong>{replyItem.username}</strong>
                <p style={{ margin: 0 }}>↳ {replyItem.text}</p>
              </div>
            </div>
          ))}
        </div>
      ))}{" "}
      {(post.comments ?? []).length > 3 && (
        <button
          onClick={() =>
            setShowAllComments((prev) => ({
              ...prev,
              [index]: !prev[index],
            }))
          }
        >
          {showAllComments[index] ? "عرض أقل ▲" : "عرض المزيد ▼"}
        </button>
      )}
    </>
  );
}

export default CommentSection;
