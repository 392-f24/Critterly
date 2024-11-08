import React, { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaMagic } from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";
import { storage, db, useAuthState } from "../utilities/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import callGPT from "../utilities/aicall.js";
import GoogleMapsLoader from '../utilities/googleMapsLoader';

const CreatePost = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [characterization, setCharacterization] = useState(null);
  const [user] = useAuthState();
  const navigate = useNavigate();
  const [isCharacterizing, setIsCharacterizing] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoadingMaps, setIsLoadingMaps] = useState(true);
  
  // Add refs for autocomplete
  const autocompleteRef = useRef(null);
  const locationInputRef = useRef(null);

  // Initialize Google Maps
  useEffect(() => {
    const initializeMaps = async () => {
      try {
        await GoogleMapsLoader.load();
        setIsLoadingMaps(false);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };
    initializeMaps();
  }, []);

  // Initialize Autocomplete
  useEffect(() => {
    if (!isLoadingMaps && locationInputRef.current && !autocompleteRef.current && window.google) {
      try {
        const options = {
          fields: ["formatted_address", "geometry", "name"],
          componentRestrictions: { country: "us" },
          types: ["geocode", "establishment"]
        };

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          locationInputRef.current,
          options
        );

        // Add place_changed event listener
        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          if (place.formatted_address) {
            setLocation(place.formatted_address);
          } else if (place.name) {
            setLocation(place.name);
          }
        });
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
      }
    }

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoadingMaps]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file.");
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage({ file, url: imageUrl });
      setImageUrl(null); // Reset imageUrl when new image is selected
      setCharacterization(null); // Reset characterization when new image is selected
    }
  };

  const handleCharacterizeImage = async () => {
    if (!selectedImage || !user) return;

    try {
      setIsCharacterizing(true);

      // Upload image to storage
      const imageRef = ref(storage, `posts/${Date.now()}_${selectedImage.file.name}`);
      await uploadBytes(imageRef, selectedImage.file);
      const uploadedImageUrl = await getDownloadURL(imageRef);
      setImageUrl(uploadedImageUrl);

      // Get characterization from GPT
      const generateCharacterization = await callGPT(uploadedImageUrl);
      setCharacterization(generateCharacterization);
    } catch (error) {
      console.error("Error characterizing image:", error);
    } finally {
      setIsCharacterizing(false);
    }
  };

  const handlePostSubmit = async () => {
    if (!selectedImage || !caption || !location || !user || !imageUrl) return;

    try {
      setIsPosting(true);

      const postRef = doc(db, "posts", Date.now().toString());
      const postData = {
        caption,
        geotag: location,
        imageUrl,
        characterization: characterization || "", // Make characterization optional
        createdAt: new Date(),
        userId: user.uid,
      };

      await setDoc(postRef, postData);

      // Reset form
      setSelectedImage(null);
      setCaption("");
      setLocation("");
      setCharacterization(null);
      setImageUrl(null);

      navigate("/");
    } catch (error) {
      console.error("Error submitting post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  // Prevent form submission on enter key in location input
  const handleLocationKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/")} style={styles.backButton}>
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

        {(characterization || isCharacterizing) && (
          <div style={styles.characterizationBox}>
            <label>Characterization:</label>
            {isCharacterizing ? (
              <div style={styles.loadingContainer}>
                <BiLoaderAlt style={styles.loadingIcon} className="spin" />
                <p style={styles.loadingText}>Analyzing image...</p>
              </div>
            ) : (
              <p style={styles.characterizationText}>{characterization}</p>
            )}
          </div>
        )}

        <button
          onClick={handleCharacterizeImage}
          style={{
            ...styles.characterizeButton,
            opacity: isCharacterizing || !selectedImage || isPosting ? 0.7 : 1,
            cursor: isCharacterizing || !selectedImage || isPosting ? "not-allowed" : "pointer",
          }}
          disabled={isCharacterizing || !selectedImage || isPosting}
        >
          {isCharacterizing ? (
            <BiLoaderAlt style={{ marginRight: "8px" }} className="spin" />
          ) : (
            <FaMagic style={{ marginRight: "8px" }} />
          )}
          {isCharacterizing ? "Characterizing..." : "Characterize Image"}
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
            ref={locationInputRef}
            type="text"
            placeholder="Search for a location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleLocationKeyDown}
            style={{
              ...styles.input,
              backgroundColor: isLoadingMaps ? '#f5f5f5' : '#fff'
            }}
            disabled={isLoadingMaps}
          />
          {isLoadingMaps && (
            <div style={styles.loadingText}>Loading location search...</div>
          )}
        </div>

        <button
          onClick={handlePostSubmit}
          disabled={!selectedImage || !caption || !location || isCharacterizing || isPosting || !imageUrl}
          style={{
            ...styles.button,
            opacity: (!selectedImage || !caption || !location || isCharacterizing || isPosting || !imageUrl) ? 0.5 : 1,
            cursor: (!selectedImage || !caption || !location || isCharacterizing || isPosting || !imageUrl) ? "not-allowed" : "pointer",
          }}
        >
          {isPosting ? (
            <>
              <BiLoaderAlt style={{ marginRight: "8px" }} className="spin" />
              Posting...
            </>
          ) : (
            "Post"
          )}
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
    width: "100%",
    padding: "10px 0",
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
    overflow: "hidden",
  },
  imagePreview: {
    maxHeight: "100%",
    maxWidth: "100%",
    borderRadius: "8px",
    objectFit: "contain",
  },
  imagePlaceholder: {
    color: "#666",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    marginTop: "5px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "100px",
    marginTop: "5px",
  },
  button: {
    padding: "12px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
    fontSize: "16px",
    width: "100%",
    transition: "all 0.3s ease",
  },
  characterizeButton: {
    padding: "12px 20px",
    backgroundColor: "#ff69b4",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "15px",
    fontSize: "16px",
    width: "100%",
    transition: "all 0.3s ease",
  },
  characterizationBox: {
    marginTop: "16px",
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    border: "1px solid #dee2e6",
  },
  characterizationText: {
    margin: "8px 0 0 0",
    color: "#333",
    lineHeight: "1.5",
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
    transition: "all 0.3s ease",
    width: "fit-content",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 0",
  },
  loadingIcon: {
    fontSize: "24px",
    color: "#666",
    marginBottom: "8px",
  },
  loadingText: {
    margin: "5px 0 0",
    color: "#666",
    fontSize: "14px",
  }
};

// Add the animation styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .spin {
    animation: spin 1s linear infinite;
  }

  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }

  button:disabled {
    transform: none;
    box-shadow: none;
  }

  /* Add styles for autocomplete dropdown */
  .pac-container {
    z-index: 1050;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  }

  .pac-item {
    padding: 8px;
    font-size: 14px;
    cursor: pointer;
  }

  .pac-item:hover {
    background-color: #f5f5f5;
  }

  .pac-item-selected {
    background-color: #e9ecef;
  }
`;
document.head.appendChild(styleSheet);

export default CreatePost;