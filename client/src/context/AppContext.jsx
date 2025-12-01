import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
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

                if (token) {
                    // Verify token and get user data
                    const { data } = await api.get('/api/user/data', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (data.success) {
                        setUser(data.user);
                    } else {
                        localStorage.removeItem('token');
                        setUser(null);
                        navigate('/login');
                    }
                } else {
                    setUser(null);
                    navigate('/login');
                }
            } catch (error) {
                console.error('Auth check error:', error);
                localStorage.removeItem('token');
                setUser(null);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuthState();
    }, []);

    // Load chats based on user status
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
            } else {
                setChats([]);
                setSelectedChat(null);
            }
        };
        loadChats();
    }, [user]);

    // User login function
    const loginUser = async (userData) => {
        setLoading(true);
        try {
            const { data } = await api.post('/api/user/login', userData);

            if (data.success) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                navigate('/');
                return { success: true };
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
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
                navigate('/');
                return { success: true };
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
        localStorage.removeItem('token');
        setUser(null);
        setChats([]);
        setSelectedChat(null);
        setLoading(false);
        navigate('/login');
    };

    // Add new chat
    const addNewChat = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await api.post('/api/chat/create', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
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
        // Real API logic
        if (!selectedChat) {
            // Create chat first if doesn't exist
            await addNewChat();
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
                        _id: Date.now().toString(),
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
        try {
            const token = localStorage.getItem('token');
            await api.delete('/api/chat/delete', {
                headers: { Authorization: `Bearer ${token}` },
                data: { chatId }
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
        isLoggedIn: !!user
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