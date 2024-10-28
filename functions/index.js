/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });



const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({ origin: true })); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies

// POST endpoint for creating a post
app.post('/api/post', async (req, res) => {
  const { caption, geotag, imageUrl, createdAt, userId } = req.body;

  // Validate input data
  if (!caption || !imageUrl || !userId) {
    return res.status(400).send({ error: 'Caption, image URL, and user ID are required.' });
  }

  try {
    // Save post data to Firestore
    const postRef = await admin.firestore().collection('posts').add({
      caption,
      geotag,
      imageUrl,
      createdAt,
      userId,
    });

    // Optionally return the created post data or its ID
    res.status(201).send({ id: postRef.id, caption, geotag, imageUrl, createdAt, userId });
  } catch (error) {
    console.error('Error saving post to Firestore:', error);
    res.status(500).send({ error: 'Failed to save post.' });
  }
});

// Expose the Express app as a Cloud Function
exports.api = functions.https.onRequest(app);



/*
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const fileParser = require("express-multipart-file-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const { Readable } = require("stream");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage().bucket();

const app = express();

app.use(fileParser);
app.use(cors({origin: true }));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.post('/post', async (req, res) => {
    try {
        const file = req.files[0];

        if (!file) {
            return res.status(400).send("No File Uploaded");
        }
        console.log(file); // file details

        // convert file buffer to file stream
        const fileStream = Readable.from(file.buffer);
        const fileUpload = storage.file(`test/${file.originalname}`);

        const writeStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        // pipe the filestream to be written to storage
        fileStream
            .pipe(writeStream)
            .on("error", error => {
                console.log("Error:", error);
                res.status(500).send({message: error.message});
            })
            .on("finish", async () => {
                try {
                    // make file public
                    await fileUpload.makePublic();

                    // get public url of uploaded file
                    const publicUrl = `https://storage.googleapis.com/${storage.name}/${fileUpload.name}`;
                    
                    // get other user provided data for post
                    const {userId, location, caption} = req.body;
                    const timestamp = admin.firestore.FieldValue.serverTimestamp();

                    // Save metadata to Firestore
                    const docRef = await db.collection('images').add({
                        userId: userId,
                        fileUrl: publicUrl,
                        location: location,
                        caption: caption,
                        timestamp: timestamp
                    });

                    console.log("File upload and Firestore entry completed");
                    res.status(200).send({ fileUrl: publicUrl, docId: docRef.id });
                }
                catch (error) {
                    console.log("Error making file public or saving to firestore:", error);
                    res.status(500).send({message: error.message});
                }
            });
    }

    catch(error) {
        console.log("Error:", error);
        res.status(500).send({message: error.message});
    }
});

exports.api = functions.https.onRequest(app);
*/