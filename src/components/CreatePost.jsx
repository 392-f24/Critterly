import React, { useState } from "react";
import { FaMapMarkerAlt, FaArrowLeft } from "react-icons/fa";
import { storage, db, useAuthState } from "../utilities/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import LocationInput from "./LocationInput";

// CreatePost component
const CreatePost = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [geotag, setGeotag] = useState("");
  const [user] = useAuthState();
  const navigate = useNavigate();

  const handleLocationSelect = (place) => {
    setGeotag(place);
  };

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
    if (!selectedImage || !user) return;

    try {
      const imageRef = ref(storage, `posts/${Date.now()}_${selectedImage.file.name}`);
      await uploadBytes(imageRef, selectedImage.file);

      const imageUrl = await getDownloadURL(imageRef);

      const postData = {
        caption,
        geotag: "2145 Sheridan Rd, Evanston, IL 60208, USA", // hardcoded location
        imageUrl,
        createdAt: new Date(),
        userId: user.uid,
      };

      await setDoc(doc(db, "posts", Date.now().toString()), postData);

      setSelectedImage(null);
      setCaption("");
      setGeotag("");

      navigate("/");
    } catch (error) {
      console.error("Error uploading image or saving post:", error);
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

        <div style={styles.inputGroup}>
          <label>Caption</label>
          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={styles.textarea}
          />
        </div>

        <LocationInput onLocationSelect={handleLocationSelect} />

        <button
          onClick={handlePostSubmit}
          disabled={!selectedImage || !caption || !geotag}
          style={styles.button}
        >
          Post
        </button>
      </div>
    </div>
  );
};

// Add your styles here
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
