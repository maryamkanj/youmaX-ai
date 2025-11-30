import Chat from "../models/Chat.js";

// API controllers for creating new chat
export const createChat = async (req, res) =>{
    try {
        const userId = req.user._id;

        const chatData = {
            userId,
            userName: req.user.name,
            name: "New Chat",
            messages: [] // This should match your model field name
        }
        
        const newChat = await Chat.create(chatData);
        res.json({
            success:true,
            message:"Chat created successfully",
            chatId: newChat._id // Return the created chat ID
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//API Controller to getting all chats
export const getChats = async (req, res) =>{
    try {
        const userId = req.user._id;
        const chats = await Chat.find({userId}).sort({updatedAt: -1}); // Fixed toSorted issue
        
        res.json({
            success:true,
            message:"Chats fetched successfully",
            chats
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// API Controller for deleting a chat
export const deleteChat = async (req, res) => {
    try{
        const userId = req.user._id
        const {chatId} = req.body

        await Chat.deleteOne({_id:chatId, userId})
        res.json({
            success:true,
            message:"Chat deleted successfully"
        })
    }catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}