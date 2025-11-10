// routes/chatRoutes.js
import express from "express";
import { handleChat, getChatHistory } from "../controllers/chatController.js";
const router = express.Router();

// Handle new chat messages
router.post("/chat", handleChat);

// Get chat history
router.get("/chat/history", getChatHistory);

export default router;
