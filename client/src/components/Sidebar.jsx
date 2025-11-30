import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const Sidebar = () => {
    const { chats, setSelectedChat, selectedChat, user, logout, addNewChat, deleteChat, isGuest } = useAppContext();
    const [search, setSearch] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Function to get user initials for profile icon
    const getUserInitials = () => {
        if (isGuest) return "G";
        if (!user?.name) return "U";
        return user.name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Function to handle logout
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    // Function to handle item clicks (closes sidebar on mobile)
    const handleItemClick = (callback) => {
        if (window.innerWidth < 768) {
            setIsMobileMenuOpen(false);
        }
        if (callback) callback();
    };

    // Function to handle chat selection
    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        if (window.innerWidth < 768) {
            setIsMobileMenuOpen(false);
        }
    };

    // Function to handle new chat creation
    const handleNewChat = () => {
        addNewChat();
        if (window.innerWidth < 768) {
            setIsMobileMenuOpen(false);
        }
    };

    // Function to handle navigation
    const handleNavigation = (path) => {
        navigate(path);
        if (window.innerWidth < 768) {
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <>
            {/* Mobile Toggle Button - Arrow that changes direction */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`md:hidden fixed top-4 z-50 p-2 rounded-lg bg-black/80 backdrop-blur-md border border-[#FF0000]/30 text-white transition-all duration-500 ${isMobileMenuOpen ? 'left-72 max-w-xs' : 'left-4'
                    }`}
                aria-label="Toggle sidebar"
            >
                <svg
                    className="w-6 h-6 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {isMobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    )}
                </svg>
            </button>

            {/* Sidebar */}
            <div className={`
                flex flex-col h-screen p-5
                bg-black/95
                border-r border-[#FF0000]/30 backdrop-blur-3xl 
                transition-all duration-500 ease-in-out
                
                w-72
                lg:w-72 md:w-64
                
                max-md:fixed max-md:top-0 max-md:left-0 max-md:z-40
                max-md:w-full max-md:max-w-xs
                ${isMobileMenuOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}
                
                sm:max-w-xs
            `}>
                {/* Branding - text instead of logo */}
                <div className="w-full mb-6 px-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[#950101] via-[#FF0000] to-[#FF0000] bg-clip-text text-transparent mb-1">
                        YoumaX
                    </h1>
                    <p className="text-sm text-white/60 font-light">
                        your AI assistant
                    </p>
                </div>

                {/* New chat button */}
                <button
                    onClick={() => handleItemClick(handleNewChat)}
                    className='flex items-center justify-center gap-2 w-full p-3 rounded-lg border border-[#FF0000]/30 bg-gradient-to-r from-[#3D0000] to-[#950101] hover:from-[#3D0000] hover:to-[#FF0000] transition-all duration-300 text-white font-medium'
                >
                    <span className='text-xl'>+</span>
                    <span>New Chat</span>
                </button>

                {/* Search bar - directly under new chat button */}
                <div className='flex items-center gap-2 p-3 mt-3 border border-white/20 rounded-md bg-white/5'>
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                        type="text"
                        placeholder='Search convos'
                        className='flex-1 text-sm bg-transparent placeholder:text-white/40 outline-none text-white'
                    />
                </div>

                {/* Recent chats header */}
                {chats.length > 0 && (
                    <p className='mt-4 text-sm font-medium text-white/80 px-2'>
                        Recent Chats
                    </p>
                )}

                {/* Chat list - scrollable area with responsive design */}
                <div className='flex-1 overflow-y-auto mt-3 text-sm space-y-2 pr-1'>
                    {chats
                        .filter((chat) =>
                            chat.messages[0]
                                ? chat.messages[0]?.content.toLowerCase().includes(search.toLowerCase())
                                : chat.name.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((chat) => (
                            <div
                                key={chat._id}
                                onClick={() => handleChatSelect(chat)}
                                className={`p-3 px-4 border rounded-md cursor-pointer flex items-start justify-between gap-2 group transition-all duration-200 ${selectedChat?._id === chat._id
                                    ? 'bg-[#950101]/50 border-[#FF0000]'
                                    : 'bg-[#3D0000]/50 border-[#FF0000]/15 hover:bg-[#3D0000]/70'
                                    }`}
                            >
                                {/* Chat content - takes most of the space, responsive truncation */}
                                <div className='flex-1 min-w-0 overflow-hidden'>
                                    <p className='truncate text-white font-medium text-sm md:text-base'>
                                        {chat.messages.length > 0
                                            ? chat.messages[0].content.slice(0, 40) + (chat.messages[0].content.length > 40 ? '...' : '')
                                            : chat.name}
                                    </p>
                                    <p className='text-xs text-white/60 mt-1 truncate'>
                                        {moment(chat.updatedAt).fromNow()}
                                    </p>
                                </div>

                                {/* Delete button - shows on hover on desktop, always visible on mobile */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Delete this chat?')) {
                                            deleteChat(chat._id);
                                        }
                                    }}
                                    className='opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 max-md:opacity-60 transition-opacity duration-200 p-1.5 hover:bg-red-500/20 rounded-md flex-shrink-0'
                                    aria-label='Delete chat'
                                >
                                    <svg
                                        className="w-4 h-4 text-white/60 hover:text-red-500 transition-colors"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))
                    }
                </div>

                {/* Bottom Menu Items Group */}
                <div className="mt-auto pt-4 space-y-3">
                    {/* User Account Section */}
                    <div className="p-3 rounded-lg border border-[#FF0000]/30 bg-gradient-to-r from-[#3D0000]/5 to-[#950101]/5">
                        {/* User Profile with Initials */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#950101] to-[#FF0000] flex items-center justify-center text-white font-bold text-sm">
                                {getUserInitials()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {isGuest ? 'Guest User' : user ? user.name : 'User'}
                                </p>
                                <p className="text-xs text-white/60 truncate">
                                    {isGuest ? 'Temporary Session' : user ? user.email : 'Login to your account'}
                                </p>
                            </div>
                        </div>

                        {/* Show appropriate button based on user state */}
                        {user ? (
                            <button
                                onClick={() => handleItemClick(handleLogout)}
                                className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        ) : isGuest ? (
                            <button
                                onClick={() => handleNavigation('/login')}
                                className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-[#FF0000]/10 border border-[#FF0000]/30 text-[#FF0000] hover:bg-[#FF0000]/20 hover:text-white transition-all duration-200 text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                Login to Save Chats
                            </button>
                        ) : (
                            <button
                                onClick={() => handleNavigation('/login')}
                                className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-[#FF0000]/10 border border-[#FF0000]/30 text-[#FF0000] hover:bg-[#FF0000]/20 hover:text-white transition-all duration-200 text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;