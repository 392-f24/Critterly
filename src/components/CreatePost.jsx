import React, { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaMagic } from "react-icons/fa";
import { BiLoaderAlt, BiLeaf } from "react-icons/bi";
import { FaSkull, FaStar } from "react-icons/fa";
import { storage, db, useAuthState } from "../utilities/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import callGPT from "../utilities/aicall.js";
import GoogleMapsLoader from '../utilities/googleMapsLoader';

const WildlifeDisplay = ({ data }) => {
  if (!data) return null;

  const renderRarityStars = (rarity) => {
    return [...Array(rarity)].map((_, index) => (
      <FaStar key={index} style={{ color: '#ffd700', marginRight: '2px' }} />
    ));
  };

  const renderThreatLevel = (level) => {
    return [...Array(level)].map((_, index) => (
      <FaSkull key={index} style={{ color: '#ff4444', marginRight: '2px' }} />
    ));
  };

  return (
    <div style={styles.wildlifeContainer}>
      <div style={styles.header}>
        <BiLeaf style={{ color: '#28a745', fontSize: '24px' }} />
        <h3 style={styles.title}>{data.Species}</h3>
      </div>

      <div style={styles.infoGrid}>
        <div style={styles.infoSection}>
          <span style={styles.label}>Class:</span>
          <span style={styles.value}>{data.Class}</span>
        </div>

        <div style={styles.infoSection}>
          <span style={styles.label}>Diet:</span>
          <span style={styles.value}>{data.Diet}</span>
        </div>

        <div style={styles.infoSection}>
          <span style={styles.label}>Rarity:</span>
          <div style={styles.iconContainer}>
            {renderRarityStars(data.Rarity)}
          </div>
        </div>

        <div style={styles.infoSection}>
          <span style={styles.label}>Threat Level:</span>
          <div style={styles.iconContainer}>
            {renderThreatLevel(data.ThreatLevel)}
          </div>
        </div>
      </div>

      <div style={styles.description}>
        <p style={styles.descriptionText}>{data.Description}</p>
      </div>

      <div style={styles.funFact}>
        <span style={styles.funFactLabel}>Fun Fact:</span>
        <p style={styles.funFactText}>{data.FunFact}</p>
      </div>

      <div style={styles.tags}>
        {data.LivingThing && (
          <span style={styles.tag}>Living Thing</span>
        )}
        {data.Appropriate && (
          <span style={{...styles.tag, backgroundColor: '#e3f2fd', color: '#1976d2'}}>
            Appropriate
          </span>
        )}
      </div>
    </div>
  );
};

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
  const [showValidation, setShowValidation] = useState(false);
  
  const autocompleteRef = useRef(null);
  const locationInputRef = useRef(null);

  // Validation state
  const isImageMissing = !selectedImage;
  const isCaptionMissing = !caption.trim();
  const isLocationMissing = !location.trim();

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
      setImageUrl(null);
      setCharacterization(null);
    }
  };

  const handleCharacterizeImage = async () => {
    if (!selectedImage || !user) return;
  
    try {
      setIsCharacterizing(true);
      const imageRef = ref(storage, `posts/${Date.now()}_${selectedImage.file.name}`);
      await uploadBytes(imageRef, selectedImage.file);
      const uploadedImageUrl = await getDownloadURL(imageRef);
      setImageUrl(uploadedImageUrl);
  
      const response = await callGPT(uploadedImageUrl);
      let parsedCharacterization;
      try {
        // Clean up the response by removing markdown code block syntax
        const cleanJson = response.replace(/```json\n|\n```/g, '').trim();
        parsedCharacterization = JSON.parse(cleanJson);
        setCharacterization(parsedCharacterization);
      } catch (error) {
        console.error("Error parsing characterization:", error);
        setCharacterization(null);
      }
    } catch (error) {
      console.error("Error characterizing image:", error);
    } finally {
      setIsCharacterizing(false);
    }
  };

  const handlePostSubmit = async () => {
    if (isImageMissing || isCaptionMissing || isLocationMissing) {
      setShowValidation(true);
      return;
    }

    try {
      setIsPosting(true);

      const postRef = doc(db, "posts", Date.now().toString());
      const postData = {
        caption,
        geotag: location,
        imageUrl,
        characterization: characterization || "",
        createdAt: new Date(),
        userId: user.uid,
      };

      await setDoc(postRef, postData);

      setSelectedImage(null);
      setCaption("");
      setLocation("");
      setCharacterization(null);
      setImageUrl(null);
      setShowValidation(false);

      navigate("/");
    } catch (error) {
      console.error("Error submitting post:", error);
    } finally {
      setIsPosting(false);
    }
  };

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

        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Image {isImageMissing && showValidation && 
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
          border: isImageMissing && showValidation ? '2px dashed #ff4444' : '1px solid #ccc'
        }}>
          {selectedImage ? (
            <img
              src={selectedImage.url}
              alt="Selected"
              style={styles.imagePreview}
            />
          ) : (
            <p style={styles.imagePlaceholder}>
              {showValidation && isImageMissing 
                ? "Please select an image" 
                : "No Image Selected"}
            </p>
          )}
        </div>

        {(characterization || isCharacterizing) && (
          <div style={styles.characterizationBox}>

            {isCharacterizing ? (
              <div style={styles.loadingContainer}>
                <BiLoaderAlt style={styles.loadingIcon} className="spin" />
                <p style={styles.loadingText}>Analyzing image...</p>
              </div>
            ) : (
              <WildlifeDisplay data={characterization} />
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
          <label style={styles.label}>
            Caption {isCaptionMissing && showValidation && 
              <span style={styles.required}>* Required</span>
            }
          </label>
          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={{
              ...styles.textarea,
              border: isCaptionMissing && showValidation ? '2px solid #ff4444' : '1px solid #ccc'
            }}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Location {isLocationMissing && showValidation && 
              <span style={styles.required}>* Required</span>
            }
          </label>
          <input
            ref={locationInputRef}
            type="text"
            placeholder="Search for a location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleLocationKeyDown}
            style={{
              ...styles.input,
              backgroundColor: isLoadingMaps ? '#f5f5f5' : '#fff',
              border: isLocationMissing && showValidation ? '2px solid #ff4444' : '1px solid #ccc'
            }}
            disabled={isLoadingMaps}
          />
          {isLoadingMaps && (
            <div style={styles.loadingText}>Loading location search...</div>
          )}
        </div>

        <button
          onClick={handlePostSubmit}
          className={showValidation && (isImageMissing || isCaptionMissing || isLocationMissing) ? 'shake' : ''}
          style={{
            ...styles.button,
            backgroundColor: showValidation && (isImageMissing || isCaptionMissing || isLocationMissing) 
              ? '#ff4444' 
              : '#007bff',
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
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '5px',
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
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
    color: "#fff",border: "none",
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
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #dee2e6",
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
  },
  // Wildlife Display Styles
  wildlifeContainer: {
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#2c3e50',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '16px',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  value: {
    fontSize: '16px',
    color: '#2c3e50',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  description: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  descriptionText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#2c3e50',
  },
  funFact: {
    padding: '12px',
    backgroundColor: '#e3f2fd',
    borderRadius: '4px',
    marginBottom: '16px',
  },
  funFactLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1976d2',
    marginBottom: '4px',
  },
  funFactText: {
    margin: 0,
    fontSize: '14px',
    color: '#2c3e50',
  },
  tags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  tag: {
    padding: '4px 12px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500',
  }
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
    fontSize: 14px;
    cursor: pointer;
  }

  .pac-item:hover {
    backgroundColor: #f5f5f5;
  }

  .pac-item-selected {
    backgroundColor: #e9ecef;
  }
`;
document.head.appendChild(styleSheet);

export default CreatePost;