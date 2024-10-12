
// app.js
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');

const app = express();
const port = 8080;

const chatHistoryDir = path.join(__dirname, 'groqllama70b');

if (!fs.existsSync(chatHistoryDir)) {
  fs.mkdirSync(chatHistoryDir);
}

const apiKey = process.env.GROQ_API_KEY || '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';
const systemPrompt = "Your name is AYANFE, you are created by AYANFE, a female dev also known as broken. You have a cool and friendly personality. Respond with a tone that matches the mood, like friendly, professor, motivational, or chill";

const groq = new Groq({ apiKey });

app.use(express.json());

// Function for loading, appending, and clearing chat history here (same as before)

// API for handling chat requests remains unchanged
app.post('/ask', async (req, res) => {
  const question = req.body.question;
  const uid = req.body.uid;

  const chatHistory = loadChatHistory(uid);

  const chatMessages = [
    { "role": "system", "content": systemPrompt },
    ...chatHistory,
    { "role": "user", "content": question }
  ];

  try {
    const chatCompletion = await groq.chat.completions.create({
      "messages": chatMessages,
      "model": "llama3-70b-8192",
      "temperature": 0.6,
      "max_tokens": 8192,
      "top_p": 0.8,
      "stream": false,
      "stop": null
    });

    const assistantResponse = chatCompletion.choices[0].message.content;

    chatHistory.push({ role: "user", content: question });
    chatHistory.push({ role: "assistant", content: assistantResponse });

    appendToChatHistory(uid, chatHistory);

    res.json({ answer: assistantResponse });
  } catch (error) {
    console.error("Error in chat completion:", error);
    res.status(500).json({ error: 'Failed to retrieve answer' });
  }
});

// New API for generating images based on a prompt
app.post('/imagine', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.get(`https://upol-ai-docs.onrender.com/imagine?prompt=${encodeURIComponent(prompt)}&apikey=UPoLxyzFM-69vsg`);
    const imageUrl = response.data.url; // Assuming the API returns the image URL in this field

    res.json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Asta is running on port ${port}`);
});
