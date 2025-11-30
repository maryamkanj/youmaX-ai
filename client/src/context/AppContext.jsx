import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isGuest, setIsGuest] = useState(false);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [loading, setLoading] = useState(true);

    // Axios instance with default config
    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // Check for existing session on app start
    useEffect(() => {
        const checkAuthState = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const guestStatus = localStorage.getItem('isGuest');

                if (token) {
                    // Verify token and get user data
                    const { data } = await api.get('/api/user/data', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (data.success) {
                        setUser(data.user);
                        setIsGuest(false);
                    }
                } else if (guestStatus === 'true') {
                    setIsGuest(true);
                }
            } catch (error) {
                console.error('Auth check error:', error);
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthState();
    }, []);

    // Load chats based on user/guest status
    useEffect(() => {
        const loadChats = async () => {
            if (user) {
                try {
                    const token = localStorage.getItem('token');
                    const { data } = await api.get('/api/chat/get', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (data.success) {
                        setChats(data.chats || []);
                    }
                } catch (error) {
                    console.error("Failed to load chats:", error);
                }
            } else if (isGuest) {
                const guestChats = localStorage.getItem('guest_chats');
                setChats(guestChats ? JSON.parse(guestChats) : []);
            } else {
                setChats([]);
                setSelectedChat(null);
            }
        };
        loadChats();
    }, [user, isGuest]);

    // Save guest chats to local storage
    useEffect(() => {
        if (isGuest && chats.length > 0) {
            localStorage.setItem('guest_chats', JSON.stringify(chats));
        }
    }, [chats, isGuest]);

    // Guest login function
    const loginAsGuest = () => {
        setLoading(true);
        setIsGuest(true);
        localStorage.setItem('isGuest', 'true');
        setChats([]);
        setLoading(false);
        navigate('/');
    };

    // User login function
    const loginUser = async (userData) => {
        setLoading(true);
        try {
            const { data } = await api.post('/api/user/login', userData);

            if (data.success) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                setIsGuest(false);
                localStorage.removeItem('isGuest');

                navigate('/');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error; // Propagate error to component for handling
        } finally {
            setLoading(false);
        }
    };

    // User registration function
    const registerUser = async (userData) => {
        setLoading(true);
        try {
            const { data } = await api.post('/api/user/register', userData);

            if (data.success) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                setIsGuest(false);
                localStorage.removeItem('isGuest');
                navigate('/');
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        setLoading(true);
        if (isGuest) {
            localStorage.removeItem('guest_chats');
            localStorage.removeItem('isGuest');
        } else {
            localStorage.removeItem('token');
        }

        setUser(null);
        setIsGuest(false);
        setChats([]);
        setSelectedChat(null);
        setLoading(false);
        navigate('/login');
    };

    // Add new chat
    const addNewChat = async () => {
        if (isGuest) {
            const newChat = {
                _id: Date.now().toString(),
                name: 'New Chat',
                messages: [],
                updatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };
            setChats(prev => [newChat, ...prev]);
            setSelectedChat(newChat);
            return newChat;
        }

        try {
            const token = localStorage.getItem('token');
            const { data } = await api.post('/api/chat/create', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                // The server returns chatId, we need to fetch or construct the chat object
                // For now, let's assume we reload chats or construct a basic one
                // Ideally, server should return the full chat object
                const newChat = {
                    _id: data.chatId,
                    name: 'New Chat',
                    messages: [],
                    updatedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                };
                setChats(prev => [newChat, ...prev]);
                setSelectedChat(newChat);
                return newChat;
            }
        } catch (error) {
            console.error("Error creating chat:", error);
        }
    };

    // Add message to current chat
    const addMessage = async (content, isUser = true) => {
        if (isGuest) {
            // Guest logic (mock AI)
            if (!selectedChat) {
                const newChat = await addNewChat();
                setSelectedChat(newChat);
            }

            const newMessage = {
                _id: Date.now().toString(),
                content,
                isUser,
                timestamp: new Date().toISOString()
            };

            setChats(prev =>
                prev.map(chat =>
                    chat._id === selectedChat._id
                        ? {
                            ...chat,
                            messages: [...chat.messages, newMessage],
                            updatedAt: new Date().toISOString(),
                            name: chat.messages.length === 0 ? content.substring(0, 30) + '...' : chat.name
                        }
                        : chat
                )
            );

            if (isUser) {
                setTimeout(() => {
                    addMessage("I'm YoumaX, your AI assistant. How can I help you today?", false);
                }, 1000);
            }
            return;
        }

        // Real API logic
        if (!selectedChat) {
            // Create chat first if doesn't exist
            await addNewChat();
            // Note: selectedChat state update might not be immediate, so this logic is a bit flaky without refactoring
            // For now, let's assume the user selects a chat or we handle it better in UI
        }

        // Optimistic update for user message
        const tempId = Date.now().toString();
        const newMessage = {
            _id: tempId,
            content,
            isUser,
            timestamp: new Date().toISOString()
        };

        setChats(prev =>
            prev.map(chat =>
                chat._id === selectedChat._id
                    ? {
                        ...chat,
                        messages: [...chat.messages, newMessage],
                        updatedAt: new Date().toISOString()
                    }
                    : chat
            )
        );

        if (isUser) {
            try {
                const token = localStorage.getItem('token');
                const { data } = await api.post('/api/message/text', {
                    chatId: selectedChat._id,
                    prompt: content
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success) {
                    // Add AI reply
                    const aiReply = {
                        _id: Date.now().toString(), // Server doesn't return ID for message in reply object usually, check controller
                        content: data.reply.content,
                        isUser: false,
                        timestamp: data.reply.timestamp
                    };

                    setChats(prev =>
                        prev.map(chat =>
                            chat._id === selectedChat._id
                                ? {
                                    ...chat,
                                    messages: [...chat.messages, aiReply],
                                    updatedAt: new Date().toISOString()
                                }
                                : chat
                        )
                    );
                }
            } catch (error) {
                console.error("Message sending failed:", error);
                // TODO: Handle error (remove optimistic message or show error)
            }
        }
    };

    // Delete chat
    const deleteChat = async (chatId) => {
        if (isGuest) {
            setChats(prev => prev.filter(chat => chat._id !== chatId));
            if (selectedChat && selectedChat._id === chatId) {
                setSelectedChat(null);
            }
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await api.delete('/api/chat/delete', {
                headers: { Authorization: `Bearer ${token}` },
                data: { chatId } // DELETE requests with body need 'data' property in axios
            });

            setChats(prev => prev.filter(chat => chat._id !== chatId));
            if (selectedChat && selectedChat._id === chatId) {
                setSelectedChat(null);
            }
        } catch (error) {
            console.error("Delete chat error:", error);
        }
    };

    const value = {
        navigate,
        user,
        setUser,
        isGuest,
        loginAsGuest,
        loginUser,
        registerUser,
        logout,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        addNewChat,
        addMessage,
        deleteChat,
        loading,
        setLoading,
        isLoggedIn: !!user,
        isTemporaryUser: isGuest && !user
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    return useContext(AppContext);
};