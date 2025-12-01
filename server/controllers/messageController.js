import Chat from "../models/Chat.js";
import openai from "../configs/openai.js";
import axios from "axios";
import imagekit from "../configs/imagekit.js";

// Text based ai chat message controller 
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId, prompt } = req.body;

        const chat = await Chat.findOne({ userId, _id: chatId });
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        // Add user message to chat
        chat.messages.push({
            role: "user", // Changed to lowercase for consistency
            content: prompt,
            timestamp: Date.now(),
            isImage: false
        });

        const { choices } = await openai.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                {
                    "role": "user",
                    "content": prompt
                },
            ],
        });

        const reply = {
            ...choices[0].message,
            timestamp: Date.now(),
            isImage: false
        };

        // Add AI reply to chat
        chat.messages.push(reply);

        // Update chat name if it's the first message
        if (chat.name === "New Chat" && chat.messages.length === 2) {
            const firstUserMessage = chat.messages.find(m => m.role === 'user');
            if (firstUserMessage) {
                chat.name = firstUserMessage.content.substring(0, 50) +
                    (firstUserMessage.content.length > 50 ? '...' : '');
            }
        }

        await chat.save();

        res.json({ success: true, reply });

    } catch (error) {
        console.error("Text message error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Image based ai chat message controller 
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId, prompt } = req.body;

        // Find chat
        const chat = await Chat.findOne({ userId, _id: chatId });
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        // Push user message
        chat.messages.push({
            role: "user", // Changed to lowercase for consistency
            content: prompt,
            timestamp: Date.now(),
            isImage: false
        });

        // Encode the prompt
        const encodedPrompt = encodeURIComponent(prompt);

        // Construct imagekit AI generation URL
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/YoumaX/${Date.now()}.png?tr=w-800,h-800`;

        console.log('Generated Image URL:', generatedImageUrl);

        // Trigger generation by fetching from ImageKit
        const aiImageResponse = await axios.get(generatedImageUrl, {
            responseType: 'arraybuffer'
        });

        // Convert to Base64 (removed extra space)
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString('base64')}`;

        console.log('Base64 image created');

        // Upload to ImageKit media library
        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "YoumaX",
            useUniqueFileName: true
        });

        console.log('Image uploaded to ImageKit:', uploadResponse.url);

        // Create AI reply object
        const reply = {
            role: "assistant",
            content: uploadResponse.url,
            timestamp: Date.now(),
            isImage: true,
        };

        // Add AI reply to chat

        // Update chat name if it's the first message
        if (chat.name === "New Chat" && chat.messages.length === 2) {
            const firstUserMessage = chat.messages.find(m => m.role === 'user');
            if (firstUserMessage) {
                chat.name = firstUserMessage.content.substring(0, 50) +
                    (firstUserMessage.content.length > 50 ? '...' : '');
            }
        }

        chat.messages.push(reply);
        await chat.save();

        res.json({ success: true, reply });

    } catch (error) {
        console.log("Image message error:", error);

        // Make sure we haven't already sent a response
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}