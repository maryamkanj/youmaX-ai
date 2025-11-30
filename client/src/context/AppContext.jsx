import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isGuest, setIsGuest] = useState(false);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state

    // Check for existing session on app start
    useEffect(() => {
        const checkAuthState = async () => {
            setLoading(true);
            try {
                // Check if user is logged in (you can replace this with your actual auth check)
                const savedUser = localStorage.getItem('user');
                const guestStatus = localStorage.getItem('isGuest');

                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                } else if (guestStatus === 'true') {
                    setIsGuest(true);
                }

                // Simulate loading time
                setTimeout(() => {
                    setLoading(false);
                }, 2000);

            } catch (error) {
                console.error('Auth check error:', error);
                setLoading(false);
            }
        };

        checkAuthState();
    }, []);

    // Load chats based on user/guest status
    useEffect(() => {
        if (user) {
            // Load user's chats from persistent storage
            const userChats = localStorage.getItem(`chats_${user.id}`);
            if (userChats) {
                setChats(JSON.parse(userChats));
            } else {
                setChats([]);
            }
        } else if (isGuest) {
            // Load guest chats from temporary storage
            const guestChats = localStorage.getItem('guest_chats');
            if (guestChats) {
                setChats(JSON.parse(guestChats));
            } else {
                setChats([]);
            }
        } else {
            // Not logged in and not guest - clear chats
            setChats([]);
            setSelectedChat(null);
        }
    }, [user, isGuest]);

    // Save chats to appropriate storage
    useEffect(() => {
        if (user && chats.length > 0) {
            localStorage.setItem(`chats_${user.id}`, JSON.stringify(chats));
        } else if (isGuest && chats.length > 0) {
            localStorage.setItem('guest_chats', JSON.stringify(chats));
        }
    }, [chats, user, isGuest]);

    // Guest login function
    const loginAsGuest = () => {
        setLoading(true);
        setIsGuest(true);
        localStorage.setItem('isGuest', 'true');
        setChats([]); // Start fresh for guest

        setTimeout(() => {
            setLoading(false);
            navigate('/');
        }, 1500);
    };

    // User login function (mock - replace with actual API call)
    const loginUser = async (userData) => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const guestChats = localStorage.getItem('guest_chats');

            // Migrate guest chats to user account if any exist
            if (guestChats) {
                setChats(JSON.parse(guestChats));
                localStorage.removeItem('guest_chats');
            }

            setUser(userData);
            setIsGuest(false);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.removeItem('isGuest');

            setTimeout(() => {
                setLoading(false);
                navigate('/');
            }, 500);

        } catch (error) {
            console.error('Login error:', error);
            setLoading(false);
        }
    };

    // User registration function (mock - replace with actual API call)
    const registerUser = async (userData) => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const guestChats = localStorage.getItem('guest_chats');

            // Migrate guest chats to user account if any exist
            if (guestChats) {
                setChats(JSON.parse(guestChats));
                localStorage.removeItem('guest_chats');
            }

            setUser(userData);
            setIsGuest(false);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.removeItem('isGuest');

            setTimeout(() => {
                setLoading(false);
                navigate('/');
            }, 500);

        } catch (error) {
            console.error('Registration error:', error);
            setLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        setLoading(true);

        if (isGuest) {
            // Clear all guest data
            localStorage.removeItem('guest_chats');
            localStorage.removeItem('isGuest');
            setChats([]);
        } else {
            localStorage.removeItem('user');
        }

        setUser(null);
        setIsGuest(false);
        setSelectedChat(null);

        setTimeout(() => {
            setLoading(false);
            navigate('/login');
        }, 1000);
    };

    // Add new chat
    const addNewChat = () => {
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
    };

    // Add message to current chat
    const addMessage = (content, isUser = true) => {
        if (!selectedChat) {
            const newChat = addNewChat();
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

        // Return AI response after user message
        if (isUser) {
            setTimeout(() => {
                addMessage("I'm YoumaX, your AI assistant. How can I help you today?", false);
            }, 1000);
        }
    };

    // Delete chat
    const deleteChat = (chatId) => {
        setChats(prev => prev.filter(chat => chat._id !== chatId));
        if (selectedChat && selectedChat._id === chatId) {
            setSelectedChat(null);
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