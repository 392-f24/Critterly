import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { useAuthState } from "../utilities/firebase";
import LocationInput from "./LocationInput";

const CreatePost = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [geotag, setGeotag] = useState("");
  const [user] = useAuthState();
  const navigate = useNavigate();

  // Handle location select from the Google Places API
  const handleLocationSelect = (place) => {
    console.log('Selected place:', place);
    setGeotag(place.formatted_address); // Save the formatted address
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
        geotag,
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
      <div style={styles.formContainer}>
        <h2>Upload a Picture</h2>

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

        {/* LocationInput component for geotagging */}
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

// Styles for the component
const styles = {
  container: {
    padding: '20px',
  },
  formContainer: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  fileInput: {
    marginBottom: '10px',
  },
  imageBox: {
    width: '100%',
    height: '400px',
    backgroundColor: '#000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '10px',
  },
  imagePreview: {
    maxHeight: '100%',
    maxWidth: '100%',
  },
  imagePlaceholder: {
    color: '#fff',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: '10px',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export default CreatePost;
