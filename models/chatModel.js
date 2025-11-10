// models/chatModel.js
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  prompt: String,
  response: Object,
  pptPath: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Chat", chatSchema);
