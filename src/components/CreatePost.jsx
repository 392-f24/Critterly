import React, { useState } from "react";
import { FaArrowLeft, FaMagic } from "react-icons/fa";
import { storage, db, useAuthState } from "../utilities/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import callGPT from "../utilities/aicall.js";

const CreatePost = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [user] = useAuthState();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file.");
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage({ file, url: imageUrl });
    }
  };

  const handlePostSubmit = async () => {
    if (!postId || !user) return; // Ensure postId is set

    try {
      const postRef = doc(db, "posts", postId);

      // Update the existing post with the final caption and geotag
      await setDoc(postRef, { caption, geotag: location }, { merge: true });

      setSelectedImage(null);
      setCaption("");
      setLocation("");
      setPostId(null); // Clear the postId after submitting

      navigate("/");
    } catch (error) {
      console.error("Error submitting post:", error);
    }
  };


  const [postId, setPostId] = useState(null); // Add this state to store the document ID

  const handleCharacterizeImage = async () => {
    if (!selectedImage || !user) return;

    try {
      // Step 1: Upload Image to Firebase and get URL
      const imageRef = ref(storage, `posts/${Date.now()}_${selectedImage.file.name}`);
      await uploadBytes(imageRef, selectedImage.file);
      const imageUrl = await getDownloadURL(imageRef);

      // Call GPT API to generate caption based on the image URL
      const generatedCaption = await callGPT(imageUrl); // Await the result of callGPT

      // Step 2: Create an initial post with empty caption and geotag
      const postRef = doc(db, "posts", Date.now().toString()); // Generate a unique ID for the post
      const initialPostData = {
        caption: generatedCaption, // Set the caption here
        geotag: "",  // Empty geotag initially
        imageUrl,
        createdAt: new Date(),
        userId: user.uid,
      };
      await setDoc(postRef, initialPostData);

      // Step 3: Update the component's state with the generated caption
      setCaption(generatedCaption); // Update the caption state
      setPostId(postRef.id); // Store the document ID for later updates
      alert("Image characterized. You can now submit after generating a caption.");
    } catch (error) {
      console.error("Error characterizing image:", error);
    }
  };



  return (
    <div style={styles.container}>
      <button
        onClick={() => navigate("/")}
        style={styles.backButton}
      >
        <FaArrowLeft style={{ marginRight: "8px" }} />
        Back to Map
      </button>

      <div style={styles.formContainer}>
        <h2>Create a New Post</h2>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={styles.fileInput}
        />

        <div style={styles.imageBox}>
          {selectedImage ? (
            <img
              src={selectedImage.url}
              alt="Selected"
              style={styles.imagePreview}
            />
          ) : (
            <p style={styles.imagePlaceholder}>No Image Selected</p>
          )}
        </div>

        <button
          onClick={handleCharacterizeImage}
          style={styles.characterizeButton}
        >
          <FaMagic style={{ marginRight: "8px" }} />
          Characterize Image
        </button>

        <div style={styles.inputGroup}>
          <label>Caption</label>
          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={styles.textarea}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Location</label>
          <input
            type="text"
            placeholder="Enter location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={styles.input}
          />
        </div>

        <button
          onClick={handlePostSubmit}
          disabled={!selectedImage || !caption || !location}
          style={styles.button}
        >
          Post
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  formContainer: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  fileInput: {
    marginBottom: "10px",
  },
  imageBox: {
    width: "100%",
    height: "300px",
    backgroundColor: "#e0e0e0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "10px",
    borderRadius: "8px",
  },
  imagePreview: {
    maxHeight: "100%",
    maxWidth: "100%",
    borderRadius: "8px",
  },
  imagePlaceholder: {
    color: "#666",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: "10px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "100px",
  },
  button: {
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
    fontSize: "16px",
  },
  characterizeButton: {
    padding: "10px 15px",
    backgroundColor: "#ff69b4",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
    fontSize: "16px",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    padding: "10px 15px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "20px",
    textDecoration: "none",
    fontSize: "16px",
  },
};

export default CreatePost;