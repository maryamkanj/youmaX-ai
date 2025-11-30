import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    userId: {
        type:String,
        ref: 'User',
        required:true
    },
    userName: {
        type:String,
        required:true
    },
    name: {
        type:String,
        required:true
    },
messages: [  
    {
        isImage:{
            type:Boolean,
            required:true
        },
        role:{
            type:String,
            required:true
        },
        content:{
            type:String,
            required:true
        },
        timestamp:{
            type:Number,
            required:true
        },
    }
]
},{
    timestamps:true
})

export default mongoose.model("Chat", ChatSchema) 