import React, { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaMagic } from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";
import { storage, db, useAuthState } from "../utilities/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import callGPT from "../utilities/aicall.js";
import GoogleMapsLoader from '../utilities/googleMapsLoader';


// Step 1: Initial Upload Component
const ImageLocationUpload = ({ onNext, isLoadingMaps }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [location, setLocation] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const autocompleteRef = useRef(null);
  const locationInputRef = useRef(null);

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
    }
  };

  const handleNext = () => {
    if (!selectedImage || !location.trim()) {
      setShowValidation(true);
      return;
    }
    onNext(selectedImage, location);
  };

  return (
    <div style={styles.formContainer}>
      <h2>Step 1: Upload Image & Location</h2>
      
      <div style={styles.inputGroup}>
        <label style={styles.label}>
          Image {!selectedImage && showValidation && 
            <span style={styles.required}>* Required</span>
          }
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={styles.fileInput}
        />
      </div>

      <div style={{
        ...styles.imageBox,
        border: !selectedImage && showValidation ? '2px dashed #ff4444' : '1px solid #ccc'
      }}>
        {selectedImage ? (
          <img
            src={selectedImage.url}
            alt="Selected"
            style={styles.imagePreview}
          />
        ) : (
          <p style={styles.imagePlaceholder}>
            {showValidation && !selectedImage 
              ? "Please select an image" 
              : "No Image Selected"}
          </p>
        )}
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>
          Location {!location && showValidation && 
            <span style={styles.required}>* Required</span>
          }
        </label>
        <input
          ref={locationInputRef}
          type="text"
          placeholder="Search for a location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{
            ...styles.input,
            backgroundColor: isLoadingMaps ? '#f5f5f5' : '#fff',
            border: !location && showValidation ? '2px solid #ff4444' : '1px solid #ccc'
          }}
          disabled={isLoadingMaps}
        />
        {isLoadingMaps && (
          <div style={styles.loadingText}>Loading location search...</div>
        )}
      </div>

      <button
        onClick={handleNext}
        style={{
          ...styles.button,
          backgroundColor: '#007bff'
        }}
      >
        Next Step
      </button>
    </div>
  );
};

// Step 2: Characterization and Caption Component
const CharacterizationCaption = ({ imageData, location, onBack, onSubmit }) => {
  const [characterization, setCharacterization] = useState(null);
  const [caption, setCaption] = useState("");
  const [isCharacterizing, setIsCharacterizing] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [user] = useAuthState();
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    handleCharacterizeImage();
  }, []);

  const getBase64FromFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCharacterizeImage = async () => {
    try {
      setIsCharacterizing(true);
      const base64image = await getBase64FromFile(imageData.file);
      const formattedImage = `data:image/jpeg;base64,${base64image.split(',')[1]}`; // Add prefix
      // Use the temporary URL for characterization without uploading
      const generateCharacterization = await callGPT(formattedImage);
      setCharacterization(generateCharacterization);
    } catch (error) {
      console.error("Error characterizing image:", error);
    } finally {
      setIsCharacterizing(false);
    }
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      setShowValidation(true);
      return;
    }

    if (!characterization) {
      alert("Please wait for image characterization to complete");
      return;
    }

    try {
      setIsPosting(true);
      
      // Upload image only when posting
      const imageRef = ref(storage, `posts/${Date.now()}_${imageData.file.name}`);
      await uploadBytes(imageRef, imageData.file);
      const uploadedImageUrl = await getDownloadURL(imageRef);

      // Submit all data together
      await onSubmit({
        imageUrl: uploadedImageUrl,
        characterization,
        caption,
        location
      });
    } catch (error) {
      console.error("Error posting:", error);
      alert("Error posting. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h2>Step 2: Review & Add Caption</h2>

      <div style={styles.imageBox}>
        <img
          src={imageData.url}
          alt="Selected"
          style={styles.imagePreview}
        />
      </div>

      <div style={styles.infoBox}>
        <strong>Location:</strong> {location}
      </div>

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

      <div style={styles.inputGroup}>
        <label style={styles.label}>
          Caption {!caption && showValidation && 
            <span style={styles.required}>* Required</span>
          }
        </label>
        <textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          style={{
            ...styles.textarea,
            border: !caption && showValidation ? '2px solid #ff4444' : '1px solid #ccc'
          }}
        />
      </div>

      <div style={styles.buttonGroup}>
        <button
          onClick={onBack}
          style={{
            ...styles.button,
            backgroundColor: '#6c757d',
            marginRight: '10px'
          }}
          disabled={isPosting}
        >
          Back
        </button>
        
        {user ? (
          <button
            onClick={handleSubmit}
            style={{
              ...styles.button,
              backgroundColor: '#28a745',
              opacity: (isCharacterizing || isPosting || !characterization) ? 0.7 : 1,
              cursor: (isCharacterizing || isPosting || !characterization) ? 'not-allowed' : 'pointer',
            }}
            disabled={isCharacterizing || isPosting || !characterization}
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
        ) : (
          <div style={styles.signInMessage}>
            Please sign in to post
          </div>
        )}
      </div>
    </div>
  );
};

// Main CreatePost Component
const CreatePost = () => {
  const [step, setStep] = useState(1);
  const [postData, setPostData] = useState(null);
  const [isLoadingMaps, setIsLoadingMaps] = useState(true);
  const navigate = useNavigate();
  const [user] = useAuthState();

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

  const handleFirstStep = (selectedImage, location) => {
    setPostData({ selectedImage, location });
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setPostData(null);
  };

  const handleSubmit = async (finalData) => {
    try {
      const postRef = doc(db, "posts", Date.now().toString());
      await setDoc(postRef, {
        ...finalData,
        createdAt: new Date(),
        userId: user.uid,
      });
      navigate("/");
    } catch (error) {
      console.error("Error submitting post:", error);
      throw error; // Re-throw to be handled by the CharacterizationCaption component
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/")} style={styles.backButton}>
        <FaArrowLeft style={{ marginRight: "8px" }} />
        Back to Map
      </button>

      {step === 1 && (
        <ImageLocationUpload
          onNext={handleFirstStep}
          isLoadingMaps={isLoadingMaps}
        />
      )}

      {step === 2 && postData && (
        <CharacterizationCaption
          imageData={postData.selectedImage}
          location={postData.location}
          onBack={handleBack}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

// Add any additional styles needed for new components
const additionalStyles = {
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
  },
  infoBox: {
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '15px',
    border: '1px solid #dee2e6',
  },
  signInMessage: {
    color: '#dc3545',
    fontSize: '14px',
    padding: '10px',
    textAlign: 'center',
    backgroundColor: '#f8d7da',
    borderRadius: '4px',
    border: '1px solid #f5c6cb',
  }
};
const originalStyles = {
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '5px',
  },
  required: {
    color: '#ff4444',
    fontSize: '14px',
    fontWeight: 'normal',
  },
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

const styles = {
  ...originalStyles,  // Your existing styles
  ...additionalStyles
};
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
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  .spin {
    animation: spin 1s linear infinite;
  }

  .shake {
    animation: shake 0.4s ease-in-out;
  }

  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }

  button:disabled {
    transform: none;
    box-shadow: none;
  }

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
