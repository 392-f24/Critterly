import axios from 'axios';

const prompt = `"Analyze the following image, taken in Evanston, IL on Northwestern's Campus. Provide the following information in the given JSON format template to classify this image, which should be of some living organism.

Fill each field based on your analysis, using the guidelines and options provided below:

Species: Provide the species name if recognizable (e.g., "Eastern Gray Squirrel"), or if unidentifiable, enter "Unknown." Use common name for species, don't worrry about being 100% correct.

Rarity: Assign a rarity level based on how common the species is in an urban environment in Illinois, rated from 1 to 5:

1 – Very common
2 – Common
3 – Uncommon
4 – Rare
5 – Very rare
ThreatLevel: Rate the potential danger the organism poses to humans on a scale of 1 to 5:

1 – Harmless
2 – Low threat
3 – Moderate threat
4 – High threat
5 – Extreme threat
FunFact: Provide an interesting or unique fact about the organism's habits, abilities, or adaptations, if possible. Keep it engaging and educational.

Class: Identify the general biological classification of the organism, choosing ONLY from:

"Reptile"
"Amphibian"
"Mammal"
"Bird"
"Fish"
"Insect"
"Arachnid"
"Fungi"
"Plant"
Diet: Select the organism's primary diet type from ONLY these options:

"Carnivore" – primarily consumes meat
"Herbivore" – primarily consumes plants
"Omnivore" – consumes both plants and animals
"Detritivore" – feeds on decomposing organic matter
"Fungivore" – primarily consumes fungi
"Coprophage" – consumes feces for nutrients
"Hematophage" – consumes blood
"Geophage" – consumes soil or earth substances
LivingThing: This should always be set to true for any living organism. Set to false only if it’s confirmed that the object is not alive, meaning it is invalid as an entry to be classified as a living organism.

Appropriate: Set to true if the description and species are appropriate for general audiences, or false if there are any elements that might be sensitive.

Description: Write a concise description of the organism. Include its appearance, behavior, or any notable features that help identify or distinguish it in its environment.

Return your response in this JSON format, filling each field accurately based on the image and these instructions:

json example:

{
    "Species": "Eastern Gray Squirrel",
    "Rarity": 3,
    "ThreatLevel": 1,
    "FunFact": "Eastern gray squirrels are known for burying acorns and other nuts, which helps reforest areas as they often forget where they hid them.",
    "Class": "Mammal",
    "Diet": "Omnivore",
    "LivingThing": true,
    "Appropriate": true,
    "Description": "A small, gray mammal with a bushy tail, commonly found on college campuses and in urban parks. Known for its adaptability and scavenging habits."
}
Follow this format closely, ensuring each field is complete and accurate based on the image content."`;

const callGPT = async (image_link) => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o',
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            {
                                type: "image_url",
                                image_url: {
                                    "url": image_link,
                                },
                            }
                        ],
                    },
                ],
                max_tokens: 200,
            },
            {
                headers: {
                    Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Log the response to the console
        console.log('GPT Response:', response.data.choices[0].message.content);
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling GPT API:', error);
        return null;
    }
};

export default callGPT;
