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


const functions = require("firebase-functions");
const axios = require("axios");

exports.getLocationSuggestions = functions.https.onRequest(async (req, res) => {
    const input = req.query.input; // Get the user input from the query parameter
    const apiKey = functions.config().google.api_key; // Ensure to set your API key in Firebase environment variables

    if (!input) {
        return res.status(400).send("Input is required.");
    }

    try {
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
            {
                params: {
                    input,
                    key: apiKey, // Use your Google Maps API key
                },
            }
        );
        res.json(response.data); // Return the data to the client
    } catch (error) {
        console.error("Error fetching location suggestions:", error);
        res.status(500).send("Error fetching location suggestions");
    }
});
