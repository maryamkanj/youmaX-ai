import React, { useEffect } from "react";
import moment from "moment";
import Markdown from "react-markdown";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

const Message = ({ message }) => {
    useEffect(() => {
        Prism.highlightAll();
    }, [message.content]);

    const isUser = message.role === 'user' || message.isUser;

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
            {isUser ? (
                <div className="flex flex-col gap-1 max-w-2xl">
                    <div className='inline-flex flex-col gap-2 p-3 px-4 bg-gradient-to-r from-[#3D0000] to-[#950101] border border-[#FF0000]/30 rounded-2xl rounded-tr-none'>
                        <p className="text-sm font-medium text-white">{message.content}</p>
                    </div>
                    <span className="text-xs text-white/60 text-right mr-2">
                        {moment(message.timestamp).fromNow()}
                    </span>
                </div>
            ) : (
                <div className="flex flex-col gap-1 max-w-2xl">
                    <div className='inline-flex flex-col gap-2 p-3 px-4 bg-[#3D0000]/50 border border-[#FF0000]/30 rounded-2xl rounded-tl-none'>
                        {message.isImage ? (
                            <div className="rounded-lg overflow-hidden max-w-full">
                                <img
                                    src={message.content}
                                    alt="AI generated"
                                    className="max-w-full h-auto rounded-lg"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/400x400/3D0000/FFFFFF?text=Image+Not+Found";
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="text-sm font-medium text-white reset-tw">
                                <Markdown>{message.content}</Markdown>
                            </div>
                        )}
                    </div>
                    <span className="text-xs text-white/60 ml-2">
                        {moment(message.timestamp).fromNow()}
                    </span>
                </div>
            )}
        </div>
    );
};

export default Message;