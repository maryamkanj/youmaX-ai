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
    const [error, setError] = useState(null);

    // Axios instance with default config
    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // Add request interceptor to add token
    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Add response interceptor to handle token expiration
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                setUser(null);
                navigate('/login');
            }
            return Promise.reject(error);
        }
    );

    // Check for existing session on app start
    useEffect(() => {
        const checkAuthState = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');

                if (token) {
                    // Verify token and get user data
                    const { data } = await api.get('/api/user/data');

                    if (data.success) {
                        setUser(data.user);
                        await loadChats();
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

    // Load chats function
    const loadChats = async () => {
        try {
            const { data } = await api.get('/api/chat/get');
            if (data.success) {
                // Transform chat data to match frontend structure
                const transformedChats = data.chats.map(chat => ({
                    _id: chat._id,
                    name: chat.name,
                    messages: chat.messages ? chat.messages.map(msg => ({
                        _id: msg._id || Date.now().toString(),
                        content: msg.content,
                        isUser: msg.role === 'user',
                        role: msg.role,
                        timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString(),
                        isImage: msg.isImage || false
                    })) : [],
                    updatedAt: chat.updatedAt,
                    createdAt: chat.createdAt
                }));
                setChats(transformedChats);
            }
        } catch (error) {
            console.error("Failed to load chats:", error);
            setError("Failed to load chats");
        }
    };

    // User login function
    const loginUser = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/api/user/login', userData);

            if (data.success) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                await loadChats();
                navigate('/');
                return { success: true };
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || 'Login failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // User registration function
    const registerUser = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/api/user/register', userData);

            if (data.success) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                await loadChats();
                navigate('/');
                return { success: true };
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.response?.data?.message || 'Registration failed');
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
            const { data } = await api.post('/api/chat/create');
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
            setError("Failed to create new chat");
        }
    };

    // Add message to current chat
    const addMessage = async (content, mode = 'text') => {
        if (!selectedChat) {
            // Create chat first if doesn't exist
            await addNewChat();
            return;
        }

        const isImageMode = mode === 'image';

        // Generate temporary IDs for optimistic updates
        const userTempId = `temp-user-${Date.now()}`;
        const aiTempId = `temp-ai-${Date.now()}`;

        // Optimistic update for user message
        const userMessage = {
            _id: userTempId,
            content,
            isUser: true,
            role: 'user',
            timestamp: new Date().toISOString(),
            isImage: false
        };

        // Update state optimistically
        setChats(prev =>
            prev.map(chat =>
                chat._id === selectedChat._id
                    ? {
                        ...chat,
                        messages: [...chat.messages, userMessage],
                        updatedAt: new Date().toISOString()
                    }
                    : chat
            )
        );

        try {
            const endpoint = isImageMode ? '/api/message/image' : '/api/message/text';
            const { data } = await api.post(endpoint, {
                chatId: selectedChat._id,
                prompt: content
            });

            if (data.success && data.reply) {
                // Transform backend reply to frontend format
                const aiReply = {
                    _id: data.reply._id || aiTempId,
                    content: data.reply.content,
                    isUser: false,
                    role: data.reply.role || 'assistant',
                    timestamp: new Date(data.reply.timestamp || Date.now()).toISOString(),
                    isImage: data.reply.isImage || false
                };

                // Update with real AI response, removing temporary user message
                setChats(prev =>
                    prev.map(chat =>
                        chat._id === selectedChat._id
                            ? {
                                ...chat,
                                messages: chat.messages
                                    .filter(msg => msg._id !== userTempId)
                                    .concat([
                                        {
                                            ...userMessage,
                                            _id: `user-${Date.now()}`
                                        },
                                        aiReply
                                    ]),
                                updatedAt: new Date().toISOString()
                            }
                            : chat
                    )
                );

                // Update selected chat
                setSelectedChat(prev => ({
                    ...prev,
                    messages: [
                        ...prev.messages.filter(msg => msg._id !== userTempId),
                        {
                            ...userMessage,
                            _id: `user-${Date.now()}`
                        },
                        aiReply
                    ]
                }));

                // Refresh chats list to get updated timestamps
                await loadChats();
            }
        } catch (error) {
            console.error("Message sending failed:", error);
            setError("Failed to send message");

            // Remove optimistic update on error
            setChats(prev =>
                prev.map(chat =>
                    chat._id === selectedChat._id
                        ? {
                            ...chat,
                            messages: chat.messages.filter(msg => msg._id !== userTempId)
                        }
                        : chat
                )
            );
        }
    };

    // Delete chat
    const deleteChat = async (chatId) => {
        try {
            await api.delete('/api/chat/delete', { data: { chatId } });

            setChats(prev => prev.filter(chat => chat._id !== chatId));
            if (selectedChat && selectedChat._id === chatId) {
                setSelectedChat(null);
            }
        } catch (error) {
            console.error("Delete chat error:", error);
            setError("Failed to delete chat");
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
        error,
        setError,
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