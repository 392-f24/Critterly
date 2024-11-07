import axios from 'axios';

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
                            { type: "text", text: "What's in this image?" },
                            {
                                type: "image_url",
                                image_url: {
                                    "url": image_link,
                                },
                            }
                        ],
                    },
                ],
                max_tokens: 50,
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
