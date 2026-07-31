function PostForm({ text, setText, setImage, addPost }) {
   return(
      <>
    
  <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <br />
      <br />

      <textarea
        placeholder="اكتب عبارة..."
        rows="4"
        cols="40"
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      <br />
      <br />

      <button onClick={addPost}>إضافة</button>

 
      </>
   );
};
export default PostForm;