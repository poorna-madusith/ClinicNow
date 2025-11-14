"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/Context/AuthContext';

interface Message {
    id: number;
    content: string;
    isBot: boolean;
    timestamp: Date;
}

interface ChatBotProps {
    onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            content: "Hello! I'm ClinicNow Bot. I can help you with general health information, answer medical questions, and provide guidance. How can I assist you today?",
            isBot: true,
            timestamp: new Date()
        }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { accessToken } = useAuth();

    const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === '' || isLoading) return;

        const userMessage: Message = {
            id: Date.now(),
            content: newMessage,
            isBot: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API}/ChatBot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ message: newMessage })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from AI');
            }

            const data = await response.json();
            
            const botMessage: Message = {
                id: Date.now() + 1,
                content: data.reply || 'Sorry, I couldn\'t process that request.',
                isBot: true,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch {
            const errorMessage: Message = {
                id: Date.now() + 1,
                content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
                isBot: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-white h-full">
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 shadow-sm">
                <div className="flex items-center space-x-3">
                    {/* Back button */}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors active:bg-purple-200"
                    >
                        <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    {/* AI Bot Avatar */}
                    <div className="relative">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                            <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        {/* Active indicator */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                            ClinicNow Bot
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800">
                                AI
                            </span>
                        </h2>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
                <div className="space-y-3 sm:space-y-4">
                    {messages.map(msg => {
                        const messageTime = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                            <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                                <div className={`flex flex-col max-w-[85%] sm:max-w-md lg:max-w-lg xl:max-w-xl ${msg.isBot ? 'items-start' : 'items-end'}`}>
                                    {msg.isBot && (
                                        <div className="flex items-center gap-2 mb-1 px-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                                                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-700">ClinicNow Bot</span>
                                        </div>
                                    )}
                                    <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-md ${
                                        msg.isBot 
                                            ? 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 text-gray-800 rounded-tl-sm' 
                                            : 'bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-br-sm'
                                    }`}>
                                        <p className="break-words text-sm sm:text-base whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1 px-2">{messageTime}</span>
                                </div>
                            </div>
                        );
                    })}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex flex-col max-w-[85%] sm:max-w-md items-start">
                                <div className="flex items-center gap-2 mb-1 px-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700">ClinicNow Bot</span>
                                </div>
                                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 shadow-md">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end space-x-2 sm:space-x-3">
                    <div className="flex-1 relative">
                        <textarea
                            rows={1}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-300 shadow-sm text-sm sm:text-base max-h-32"
                            placeholder="Ask me anything about health..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isLoading}
                        className="p-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                        <svg className="h-5 w-5 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                    AI can make mistakes. Always consult a healthcare professional for medical advice.
                </p>
            </div>
        </div>
    );
};

export default ChatBot;
