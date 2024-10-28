import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";
import { storage, db, useAuthState } from "../utilities/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

import LocationInput from "./LocationInput";


// validate users before allowing them to post
//const auth = getAuth();
//const user = auth.currentUser;

const CreatePost = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [geotag, setGeotag] = useState("");
  const [user] = useAuthState();
  const navigate = useNavigate();


  const handleLocationSelect = (place) => {
    console.log('Selected place:', place);
    setGeotag(place);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if the file is an image
      if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file.");
        return;
      }
      // Create an object URL and set it to the state
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage({ file, url: imageUrl }); // Store both file and URL
    }
  };

  const handlePostSubmit = async () => {
    if (!selectedImage || !user) return;

    try {
      // Upload the image to Firebase Storage
      const imageRef = ref(storage, `posts/${Date.now()}_${selectedImage.file.name}`);
      await uploadBytes(imageRef, selectedImage.file);
      console.log("Image uploaded successfully");

      // Get the image URL
      const imageUrl = await getDownloadURL(imageRef);
      console.log(user);

    const postData = {
      caption,
      geotag: "2145 Sheridan Rd, Evanston, IL 60208, USA", // hardcoded location
      imageUrl,
      createdAt: new Date(),
      userId: user.uid, // Use the logged-in user ID
    };
    console.log("Post Data:", postData); // Log the post data

    // Save to Firestore
    await setDoc(doc(db, "posts", Date.now().toString()), postData);


      // Reset the form state
      setSelectedImage(null);
      setCaption("");
      setGeotag("");
      //setSuggestions([]);

      navigate("/"); // Redirect to home page

    } catch (error) {
      console.error("Error uploading image or saving post:", error);
    }
  };

  /*
  const handleGeotagChange = (e) => {
    const value = e.target.value;
    setGeotag(value);
    fetchLocationSuggestions(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setGeotag(suggestion.description);
    setSuggestions([]); // Clear suggestions after selection
  };
  */

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

        <button>Characterize the Image!</button>

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
        {/*use google maps autocomplete widget*/}

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

// Add your styles here
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
  geotagContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  markerIcon: {
    marginRight: '8px',
  },
  input: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  suggestionList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    border: '1px solid #ccc',
    borderRadius: '4px',
    maxHeight: '200px',
    overflowY: 'auto',
    position: 'absolute',
    backgroundColor: 'white',
    zIndex: 10,
  },
  suggestionItem: {
    padding: '10px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f0f0f0',
    },
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
