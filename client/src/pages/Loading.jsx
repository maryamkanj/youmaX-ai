import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const Loading = () => {
    const navigate = useNavigate();
    const { user, isGuest } = useAppContext();

    useEffect(() => {
        // Shorter timeout for better UX
        const timeout = setTimeout(() => {
            // Redirect to chat interface whether user is logged in or guest
            navigate('/');
        }, 3000); // Reduced from 8s to 3s for better UX

        return () => clearTimeout(timeout);
    }, [navigate]);

    // Determine user status for personalized messages
    const getUserStatus = () => {
        if (user) {
            return {
                welcome: `Welcome back, ${user.name || user.email.split('@')[0]}!`,
                status: "Loading your conversations..."
            };
        } else if (isGuest) {
            return {
                welcome: "Welcome to YoumaX!",
                status: "Setting up guest session..."
            };
        } else {
            return {
                welcome: "Welcome to YoumaX!",
                status: "Preparing your AI assistant..."
            };
        }
    };

    const { welcome, status } = getUserStatus();

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-[#3D0000] to-black flex items-center justify-center p-4">
            <div className="text-center max-w-md mx-auto">
                {/* User Status Badge */}
                <div className="mb-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${user
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : isGuest
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${user ? 'bg-green-400' : isGuest ? 'bg-yellow-400' : 'bg-blue-400'
                            }`}></div>
                        {user ? 'Logged In' : isGuest ? 'Guest Mode' : 'Loading...'}
                    </div>
                </div>

                {/* Animated Logo */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto mb-4 relative">
                        {/* Outer glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF0000] to-[#950101] rounded-full blur-lg opacity-50 animate-pulse"></div>

                        {/* Main logo circle */}
                        <div className="absolute inset-2 bg-gradient-to-br from-[#950101] via-[#FF0000] to-[#950101] rounded-full flex items-center justify-center shadow-2xl">
                            <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center">
                                <div className="w-12 h-12 border-2 border-white/30 rounded-full animate-spin"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brand Text */}
                <h1 className="text-5xl font-bold bg-gradient-to-r from-[#FF0000] via-[#FF6B6B] to-[#FF0000] bg-clip-text text-transparent mb-2">
                    YoumaX
                </h1>
                <p className="text-white/70 text-lg mb-2 font-light">{welcome}</p>
                <p className="text-white/60 text-sm mb-6">{status}</p>

                {/* Animated Progress Bar */}
                <div className="w-full bg-[#3D0000]/50 rounded-full h-2 mb-6 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-[#950101] to-[#FF0000] h-full rounded-full animate-loading-progress"
                    ></div>
                </div>

                {/* Status Messages with sequential animation */}
                <div className="text-white/60 text-sm space-y-1 mb-6">
                    <p className="opacity-0 animate-loading-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                        🔧 Initializing AI models...
                    </p>
                    <p className="opacity-0 animate-loading-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
                        🧠 Loading neural networks...
                    </p>
                    <p className="opacity-0 animate-loading-fade-in" style={{ animationDelay: '1.4s', animationFillMode: 'forwards' }}>
                        💬 Preparing chat interface...
                    </p>
                    {isGuest && (
                        <p className="opacity-0 animate-loading-fade-in text-yellow-400/80" style={{ animationDelay: '2.0s', animationFillMode: 'forwards' }}>
                            ⚡ Guest session - chats are temporary
                        </p>
                    )}
                    {user && (
                        <p className="opacity-0 animate-loading-fade-in text-green-400/80" style={{ animationDelay: '2.0s', animationFillMode: 'forwards' }}>
                            ✅ Loading your saved conversations...
                        </p>
                    )}
                </div>

                {/* Countdown */}
                <div className="text-white/40 text-xs">
                    Starting in <span className="text-[#FF0000] font-mono">3</span> seconds
                </div>
            </div>

            {/* Background Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-[#FF0000] rounded-full animate-loading-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 3}s`
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default Loading;