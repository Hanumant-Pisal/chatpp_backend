// utils/geminiClient.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

console.log('Gemini client initializing');

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure the model
const MODEL_NAME = 'gemini-2.5-pro-preview-05-06';
const GENERATION_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

console.log(`Gemini client initialized with model: ${MODEL_NAME}`);

export const getAIResponse = async (prompt) => {
  console.log('Starting getAIResponse with prompt length:', prompt?.length);
  
  if (!prompt) {
    const error = new Error('Prompt is required');
    console.error('Error in getAIResponse:', error.message);
    throw error;
  }

  try {
    console.log('Sending request to Gemini API with prompt (first 100 chars):', prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''));
    
    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: GENERATION_CONFIG,
    });

    // Generate content with the prompt
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ 
            text: `You are a helpful AI assistant. Please provide a detailed and thoughtful response to the following: ${prompt}`
          }]
        }
      ]
    });

    const response = await result.response;
    const text = response.text();
    
    console.log('Successfully received response from Gemini API');
    return text;
    
  } catch (error) {
    console.error('Gemini API Error:', {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.response?.data || error.cause?.message || 'No additional details',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Provide more specific error messages
    if (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID')) {
      throw new Error('The provided API key is invalid. Please check your API key and try again.');
    }
    
    if (error.message.includes('not found for API version')) {
      throw new Error(`The model '${MODEL_NAME}' is not available. Please check if you have access to this model in your Google Cloud project.`);
    }
    
    throw new Error(`Failed to get response from Gemini API: ${error.message}`);
  }
};
