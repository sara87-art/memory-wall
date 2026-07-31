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
<h3>💬 التعليقات</h3>

<div className="comment-input">  
  <input  
    type="text"  
    placeholder="...اكتب تعليق"  
    value={comment}  
    onChange={(e) => setComment(e.target.value)}  
  />  <button onClick={() => addComment(index)}>
💬 إضافة تعليق
</button>

</div>  {(showAllComments[index]  
    ? (post.comments ?? [])  
    : (post.comments ?? []).slice(0, 3)  
  ).map((item, i) => (  
    
    <div className="comment" key={item._id|| item.id ||i}>  
      <p>💬 {item.text}</p>  

      <div  style={{ display: "flex", gap: "10px",  }}>

<button onClick={() => addCommentLike(index, i)}>
❤️ {item.likes}
</button>

<button onClick={() => setReplyIndex(i)}>
💬 رد
</button>

</div>  
          {replyIndex === i && (  
            <>  
              <div className="reply-box">  
  <input  
    type="text"  
    placeholder="اكتب رد..."  
    value={reply}  
    onChange={(e) => setReply(e.target.value)}  
  />  <button onClick={() => addReply(index, i)}>
📤 إرسال
</button>

</div>  
            </>  
          )}  
       {(item.replies ?? []).map((replyItem) => (  
  <p key={replyItem._id || replyItem.id} style={{ marginLeft: "25px" }}>  
    ↳ {replyItem.text}  
  </p>  
))}  
        </div>  
      ))}  {(post.comments ?? []).length > 3 && (  
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