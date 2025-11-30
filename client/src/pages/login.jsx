import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";

const Login = () => {
    const [state, setState] = useState("login")
    const { loginAsGuest, loginUser, registerUser, loading } = useAppContext()
    const [showPassword, setShowPassword] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (state === "login") {
            // Login logic
            await loginUser({
                email: formData.email,
                password: formData.password
            });
        } else {
            // Register logic
            await registerUser({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-[#3D0000] to-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-black/40 backdrop-blur-sm rounded-3xl overflow-hidden border border-[#FF0000]/20 shadow-2xl p-6 md:p-8">

                {/* Header with Chatbot Name */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-3 mb-3">

                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#FF0000] to-[#950101] bg-clip-text text-transparent">
                            YoumaX
                        </h1>
                    </div>
                    <p className="text-white/60 text-xs md:text-sm">
                        Your AI Assistant
                    </p>
                </div>

                {/* Guest Access Button */}
                <div className="mb-4">
                    <button
                        onClick={loginAsGuest}
                        disabled={loading}
                        className="w-full h-11 rounded-full text-white bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] hover:from-[#2d2d2d] hover:to-[#1a1a1a] border border-[#FF0000]/30 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Loading..." : "Try as Guest"}
                    </button>
                    <p className="text-white/40 text-xs text-center mt-2">
                        Chats will disappear when you logout
                    </p>
                </div>

                <div className="relative flex items-center justify-center mb-4">
                    <div className="border-t border-[#FF0000]/30 flex-grow"></div>
                    <span className="mx-3 text-white/40 text-xs">or</span>
                    <div className="border-t border-[#FF0000]/30 flex-grow"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-center">
                        <h2 className="text-white text-xl md:text-2xl font-bold">
                            {state === "login" ? "Welcome Back" : "Create Account"}
                        </h2>
                        <p className="text-white/60 text-xs md:text-sm mt-1">
                            {state === "login" ? "Sign in to continue" : "Join YoumaX today"}
                        </p>
                    </div>

                    {state !== "login" && (
                        <div className="flex items-center w-full bg-[#3D0000]/30 border border-[#FF0000]/30 h-11 rounded-full overflow-hidden pl-4 gap-3 transition-all duration-200 focus-within:border-[#FF0000] focus-within:bg-[#3D0000]/50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-round">
                                <circle cx="12" cy="8" r="5" />
                                <path d="M20 21a8 8 0 0 0-16 0" />
                            </svg>
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                className="flex-1 bg-transparent border-none outline-none ring-0 text-white placeholder:text-white/40 text-sm"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    )}

                    <div className="flex items-center w-full bg-[#3D0000]/30 border border-[#FF0000]/30 h-11 rounded-full overflow-hidden pl-4 gap-3 transition-all duration-200 focus-within:border-[#FF0000] focus-within:bg-[#3D0000]/50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                            <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                        </svg>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            className="flex-1 bg-transparent border-none outline-none ring-0 text-white placeholder:text-white/40 text-sm"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="flex items-center w-full bg-[#3D0000]/30 border border-[#FF0000]/30 h-11 rounded-full overflow-hidden pl-4 gap-3 transition-all duration-200 focus-within:border-[#FF0000] focus-within:bg-[#3D0000]/50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            className="flex-1 bg-transparent border-none outline-none ring-0 text-white placeholder:text-white/40 text-sm"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="pr-4 text-white/60 hover:text-white transition-colors duration-200"
                            disabled={loading}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off">
                                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                    <line x1="2" x2="22" y1="2" y2="22" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {state === "login" && (
                        <div className="text-right">
                            <button className="text-xs text-[#FF0000] hover:text-white transition-colors duration-200" type="reset" disabled={loading}>
                                Forgot password?
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 rounded-full text-white bg-gradient-to-r from-[#950101] to-[#FF0000] hover:from-[#FF0000] hover:to-[#950101] transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Loading..." : state === "login" ? "Sign In" : "Create Account"}
                    </button>

                    <p className="text-white/60 text-xs text-center">
                        {state === "login" ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            type="button"
                            onClick={() => setState(prev => prev === "login" ? "register" : "login")}
                            className="text-[#FF0000] hover:text-white transition-colors duration-200 font-medium"
                            disabled={loading}
                        >
                            {state === "login" ? "Sign Up" : "Sign In"}
                        </button>
                    </p>
                </form>

                {/* Guest warning */}
                <div className="mt-4 p-3 bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-lg">
                    <p className="text-white/60 text-xs text-center">
                        <strong>Guest Mode:</strong> Your conversations are temporary and will be lost when you logout.
                        <button
                            onClick={() => setState("register")}
                            className="text-[#FF0000] hover:text-white ml-1 font-medium"
                            disabled={loading}
                        >
                            Sign up
                        </button> to save your chats permanently.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login