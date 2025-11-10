// controllers/chatController.js
import { getAIResponse } from "../utils/geminiClient.js";
import { generatePPT } from "../utils/pptGenerator.js";
import Chat from "../models/chatModel.js";

// Get chat history
export const getChatHistory = async (req, res) => {
  console.log('=== GET /api/chat/history called ===');
  try {
    console.log('Fetching chat history from database...');
    const chats = await Chat.find().sort({ createdAt: -1 }).limit(20);
    console.log(`Found ${chats.length} chat(s) in history`);
    
    // Log first chat if exists
    if (chats.length > 0) {
      console.log('First chat sample:', {
        id: chats[0]._id,
        prompt: chats[0].prompt,
        createdAt: chats[0].createdAt
      });
    }
    
    res.json({ 
      success: true, 
      data: chats,
      count: chats.length
    });
  } catch (error) {
    console.error('Error fetching chat history:', {
      message: error.message,
      stack: error.stack,
      error: error
    });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch chat history',
      details: error.message
    });
  }
};

export const handleChat = async (req, res) => {
  console.log('=== New Request ===');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  try {
    // Validate request body
    if (!req.body) {
      console.error('Request body is empty');
      return res.status(400).json({ 
        success: false,
        error: 'Request body is required',
        timestamp: new Date().toISOString()
      });
    }

    const prompt = req.body.prompt || req.body.message;
    
    if (!prompt) {
      console.error('No prompt or message provided in request body');
      return res.status(400).json({ 
        success: false,
        error: 'Prompt or message is required in the request body',
        receivedBody: req.body,
        timestamp: new Date().toISOString()
      });
    }

    console.log('Processing request with prompt:', prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''));
    
    // Get AI response
    const aiResponse = await getAIResponse(prompt);
    
    if (!aiResponse) {
      console.error('Received empty response from AI service');
      throw new Error('Empty response from AI service');
    }

    console.log('Successfully received AI response');

    // Format the response for PPT generation
    const slideData = {
      success: true,
      slides: [
        {
          title: 'AI Response',
          content: typeof aiResponse === 'string' 
            ? aiResponse.split('\n').filter(line => line.trim() !== '')
            : ['Received non-string response from AI']
        }
      ],
      timestamp: new Date().toISOString()
    };
    
    console.log('Generating PPT with data:', slideData);
    const pptPath = await generatePPT(slideData);
    
    // Save the chat to the database
    const newChat = new Chat({
      prompt: prompt,
      response: aiResponse,
      pptPath: pptPath || '',
      slideData: slideData
    });
    
    await newChat.save();
    
    console.log('Chat saved to database');
    
    return res.json({ 
      success: true, 
      message: 'PPT generated successfully',
      pptPath,
      slideData: slideData,
      chatId: newChat._id,
      response: aiResponse
    });
  } catch (error) {
    console.error('Error in handleChat:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    return res.status(500).json({ 
      error: error.message,
      details: error.response?.data || 'No additional error details',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
