import React, { useEffect, useState, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import Message from "./Message";

const Chatbox = () => {
    const { selectedChat, addMessage, addNewChat, chats, isSendingMessage } = useAppContext();
    const [messages, setMessages] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [mode, setMode] = useState('text');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const containerRef = useRef(null);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim() || isSendingMessage) return;

        const currentPrompt = prompt;
        // Clear input immediately for better UX
        setPrompt('');

        // Add message - this will handle everything
        await addMessage(currentPrompt, mode);
    };

    useEffect(() => {
        if (selectedChat) {
            // Transform messages for Message component
            const transformedMessages = selectedChat.messages?.map(msg => ({
                _id: msg._id,
                content: msg.content,
                isUser: msg.role === 'user' || msg.isUser,
                role: msg.role,
                timestamp: msg.timestamp,
                isImage: msg.isImage || false
            })) || [];
            setMessages(transformedMessages);
        } else {
            setMessages([]);
        }
    }, [selectedChat]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const modes = [
        {
            value: 'text',
            label: 'Text Mode',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            )
        },
        {
            value: 'image',
            label: 'Image Mode',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        }
    ];

    const selectedMode = modes.find(m => m.value === mode);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isSendingMessage]);

    // Auto-select first chat if none selected
    useEffect(() => {
        if (!selectedChat && chats.length > 0) {
            // Transform for Message component compatibility
            const transformedChat = {
                ...chats[0],
                messages: chats[0].messages?.map(msg => ({
                    _id: msg._id,
                    content: msg.content,
                    isUser: msg.role === 'user' || msg.isUser,
                    role: msg.role,
                    timestamp: msg.timestamp,
                    isImage: msg.isImage || false
                })) || []
            };
            setMessages(transformedChat.messages);
        }
    }, [chats, selectedChat]);

    return (
        <div className='flex-1 flex flex-col h-screen'>
            {/* Chat Messages Area - Takes up all available space */}
            <div ref={containerRef} className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
                <div className="min-h-full flex flex-col justify-center">
                    {/* Welcome message - only shows when no messages */}
                    {messages.length === 0 && !isSendingMessage && !selectedChat && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Welcome to YoumaX
                            </h1>
                            <p className="text-white/60 text-lg md:text-xl max-w-md">
                                Create a new chat or select one from the sidebar to begin
                            </p>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="space-y-6 py-4">
                        {messages.map((message) => (
                            <Message
                                key={message._id || `${message.role}-${message.timestamp}`}
                                message={message}
                            />
                        ))}

                        {/* Loading indicator for AI response */}
                        {isSendingMessage && messages.length > 0 && (
                            <div className="flex justify-start message-animate">
                                <div className="max-w-[80%] rounded-2xl p-4 bg-[#3D0000]/30 border border-[#FF0000]/20">
                                    <div className="flex items-center gap-1.5">
                                        <div className='w-1.5 h-1.5 rounded-full bg-[#FF0000]/30 animate-bounce'></div>
                                        <div className='w-1.5 h-1.5 rounded-full bg-[#FF0000]/30 animate-bounce' style={{ animationDelay: '0.1s' }}></div>
                                        <div className='w-1.5 h-1.5 rounded-full bg-[#FF0000]/30 animate-bounce' style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Input Area - Fixed at the bottom */}
            <div className="bg-black/50 backdrop-blur-sm py-4 px-4 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
                <div className="max-w-4xl mx-auto">
                    {/* Prompt input box */}
                    <form onSubmit={onSubmit} className='bg-[#3D0000]/20 border border-[#FF0000]/30 rounded-full w-full p-2 pl-5 flex gap-3 items-center'>
                        {/* Custom Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 bg-[#3D0000] border border-[#FF0000]/30 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 hover:border-[#FF0000] hover:bg-[#950101]/80 focus:border-[#FF0000] focus:bg-[#950101]/80 min-w-[140px] justify-between"
                                disabled={isSendingMessage}
                            >
                                <div className="flex items-center gap-2">
                                    {selectedMode.icon}
                                    <span>{selectedMode.label}</span>
                                </div>
                                <svg
                                    className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute bottom-full left-0 mb-1 w-full bg-[#3D0000] border border-[#FF0000]/30 rounded-lg shadow-lg z-10 overflow-hidden">
                                    {modes.map((modeOption, index) => (
                                        <button
                                            key={modeOption.value}
                                            type="button"
                                            onClick={() => {
                                                setMode(modeOption.value);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white transition-all duration-200 ${mode === modeOption.value
                                                ? 'bg-[#950101]'
                                                : 'hover:bg-[#950101]/80'
                                                } ${index === 0 ? 'rounded-t-lg' :
                                                    index === modes.length - 1 ? 'rounded-b-lg' : ''
                                                }`}
                                        >
                                            {modeOption.icon}
                                            {modeOption.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <input
                            onChange={(e) => setPrompt(e.target.value)}
                            value={prompt}
                            type="text"
                            placeholder="Type your prompt here..."
                            className='flex-1 w-full text-sm outline-none bg-transparent text-white placeholder:text-white/40'
                            required
                            disabled={isSendingMessage}
                        />

                        {/* Send Button */}
                        <button
                            type="submit"
                            disabled={isSendingMessage || !prompt.trim()}
                            className="flex items-center justify-center p-3 rounded-full bg-gradient-to-r from-[#950101] to-[#FF0000] hover:from-[#FF0000] hover:to-[#950101] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isSendingMessage ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg
                                    className="w-5 h-5 text-white transform group-hover:scale-110 transition-transform duration-200"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                    />
                                </svg>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chatbox;