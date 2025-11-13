"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { useAuth } from '@/Context/AuthContext';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    role?: string;
}

interface Conversation {
    id: number;
    participant: User;
    lastMessage?: Message | null;
    unreadCount?: number;
}

interface Message {
    id: number;
    conversationId: number;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    isRead?: boolean;
}

interface ChatProps {
    userType: 'patient' | 'doctor';
}

const Chat: React.FC<ChatProps> = ({ userType }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const latestMessagesRef = useRef<Message[]>(messages);
    const previousConversationRef = useRef<number | null>(null);
    const { accessToken, userId } = useAuth();

    const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';
    const BASE_URL = useMemo(() => {
        if (!API) return '';
        if (API.endsWith('/api')) return API.slice(0, -4);
        if (API.endsWith('/api/')) return API.slice(0, -5);
        return API;
    }, [API]);

    latestMessagesRef.current = messages;

    useEffect(() => {
        if (!accessToken || !BASE_URL) return;
        const newConnection = new HubConnectionBuilder()
            .withUrl(`${BASE_URL}/hubs/chat`, {
                accessTokenFactory: () => accessToken ?? ''
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, [BASE_URL, accessToken]);

    useEffect(() => {
        return () => {
            if (connection) {
                connection.stop().catch(() => {});
            }
        };
    }, [connection]);

    const fetchUsers = useCallback(async () => {
        if (!API || !accessToken) return;
        try {
            const response = await fetch(`${API}/chat/users`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                credentials: 'include'
            });
            if (!response.ok) {
                // If response is not OK, don't try to parse JSON
                // and keep users as an empty array.
                console.error('Error fetching users:', response.statusText);
                setUsers([]);
                return;
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        }
    }, [API, accessToken]);

    const fetchConversations = useCallback(async () => {
        if (!API || !accessToken) return;
        try {
            const response = await fetch(`${API}/chat/conversations`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                credentials: 'include'
            });
            if (!response.ok) {
                console.error('Error fetching conversations:', response.statusText);
                setConversations([]);
                return;
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                const sorted = [...data].sort((a: Conversation, b: Conversation) => {
                    const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
                    const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
                    return bTime - aTime;
                });
                setConversations(sorted);
            } else {
                setConversations([]);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            setConversations([]);
        }
    }, [API, accessToken]);

    const fetchChatHistory = useCallback(async (conversationId: number) => {
        if (!API || !accessToken) return;
        try {
            const response = await fetch(`${API}/chat/history/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                credentials: 'include'
            });
            if (!response.ok) {
                console.error('Error fetching chat history:', response.statusText);
                setMessages([]);
                return;
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                setMessages(data);
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
            setMessages([]);
        }
    }, [API, accessToken]);

    useEffect(() => {
        if (!connection) {
            return;
        }

        let isMounted = true;

        const startConnection = async () => {
            try {
                if (connection.state === HubConnectionState.Disconnected) {
                    await connection.start();
                }

                connection.on('ReceiveMessage', (message: Message) => {
                    if (!isMounted) return;

                    setConversations(prev => {
                        let found = false;
                        const updated = prev.map(convo => {
                            if (convo.id === message.conversationId) {
                                found = true;
                                const isCurrentConversation = message.conversationId === selectedConversation?.id;
                                const isReceived = message.receiverId === userId;
                                
                                return {
                                    ...convo,
                                    lastMessage: message,
                                    unreadCount: isCurrentConversation || !isReceived 
                                        ? (convo.unreadCount || 0) 
                                        : (convo.unreadCount || 0) + 1
                                };
                            }
                            return convo;
                        });

                        if (!found) {
                            void fetchConversations();
                            return prev;
                        }

                        return [...updated].sort((a, b) => {
                            const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
                            const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
                            return bTime - aTime;
                        });
                    });

                    if (message.conversationId === selectedConversation?.id) {
                        const updatedMessages = [...latestMessagesRef.current, message];
                        setMessages(updatedMessages);
                    }
                });
            } catch (error) {
                console.error('Connection failed: ', error);
            }
        };

        startConnection();

        return () => {
            isMounted = false;
            connection.off('ReceiveMessage');
        };
    }, [connection, selectedConversation?.id, fetchConversations, userId]);

    useEffect(() => {
        if (accessToken) {
            fetchUsers();
            fetchConversations();
        }
    }, [accessToken, fetchUsers, fetchConversations]);

    const handleConversationSelect = async (conversation: Conversation) => {
        if (previousConversationRef.current && connection) {
            await connection.invoke('LeaveChat', previousConversationRef.current).catch(() => {});
        }
        setSelectedConversation(conversation);
        setMessages([]);
        await fetchChatHistory(conversation.id);
        
        // Mark messages as read and update conversation unread count
        if (conversation.unreadCount && conversation.unreadCount > 0) {
            setConversations(prev => prev.map(c => 
                c.id === conversation.id ? { ...c, unreadCount: 0 } : c
            ));
        }
        
        if (connection) {
            if (connection.state === HubConnectionState.Disconnected) {
                await connection.start().catch(err => console.error('Reconnection failed:', err));
            }
            await connection.invoke('JoinChat', conversation.id).catch(err => console.error('Join chat failed:', err));
        }
        previousConversationRef.current = conversation.id;
    };

    const handleUserSelect = async (user: User) => {
        if (!API || !accessToken) return;
        try {
            const response = await fetch(`${API}/chat/conversations/${user.id}`, {
                 method: 'POST',
                 headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                credentials: 'include'
            });
            if (!response.ok) {
                console.error('Error creating conversation:', response.statusText);
                return;
            }
            const conversation: Conversation = await response.json();
            setConversations(prev => {
                const exists = prev.some(c => c.id === conversation.id);
                if (exists) {
                    return prev;
                }
                const updated = [...prev, conversation];
                return updated.sort((a, b) => {
                    const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
                    const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
                    return bTime - aTime;
                });
            });
            await handleConversationSelect(conversation);
            await fetchConversations();
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === '' || !selectedConversation || !connection) return;

        try {
            await connection.invoke('SendMessage', selectedConversation.id, newMessage.trim());
            setNewMessage('');
        } catch (e) {
            console.error(e);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        const term = searchTerm.toLowerCase();
        return users.filter(user =>
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(term)
        );
    }, [users, searchTerm]);

    return (
        <div className="flex h-[calc(100vh-5rem)] bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Sidebar - Conversations List */}
            <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col shadow-lg">
                {/* Search Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-white">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={`Search ${userType === 'patient' ? 'doctors' : 'patients'}...`}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Conversations/Users List */}
                <div className="flex-1 overflow-y-auto">
                    {searchTerm ? (
                        <div className="divide-y divide-gray-100">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => handleUserSelect(user)}
                                        className="p-4 hover:bg-gradient-to-r hover:from-teal-50 hover:to-white cursor-pointer transition-all duration-200 flex items-center space-x-3 group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-lg shadow-md group-hover:scale-110 transition-transform duration-200">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                                            <p className="text-xs text-gray-500">{user.role || (userType === 'patient' ? 'Doctor' : 'Patient')}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    No users found
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {conversations.length > 0 ? (
                                conversations.map(convo => {
                                    const lastMessageTime = convo.lastMessage 
                                        ? new Date(convo.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                        : null;
                                    const isSelected = selectedConversation?.id === convo.id;
                                    const hasUnread = convo.unreadCount && convo.unreadCount > 0;
                                    return (
                                        <div
                                            key={convo.id}
                                            onClick={() => void handleConversationSelect(convo)}
                                            className={`p-4 cursor-pointer transition-all duration-200 flex items-start space-x-3 relative ${
                                                isSelected 
                                                    ? 'bg-gradient-to-r from-teal-100 to-teal-50 border-l-4 border-teal-500' 
                                                    : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-white'
                                            }`}
                                        >
                                            <div className="relative">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md ${
                                                    isSelected ? 'bg-gradient-to-br from-teal-500 to-teal-700' : 'bg-gradient-to-br from-gray-400 to-gray-600'
                                                }`}>
                                                    {convo.participant.firstName[0]}{convo.participant.lastName[0]}
                                                </div>
                                                {hasUnread && (
                                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-pulse">
                                                        {convo.unreadCount}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <span className={`truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                                                        {convo.participant.firstName} {convo.participant.lastName}
                                                    </span>
                                                    {lastMessageTime && (
                                                        <span className={`text-xs ml-2 flex-shrink-0 ${hasUnread ? 'text-teal-600 font-semibold' : 'text-gray-500'}`}>
                                                            {lastMessageTime}
                                                        </span>
                                                    )}
                                                </div>
                                                {convo.lastMessage && (
                                                    <p className={`text-sm truncate ${hasUnread ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                                                        {convo.lastMessage.senderId === userId && <span className="font-medium">You: </span>}
                                                        {convo.lastMessage.content}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="font-medium mb-1">No conversations yet</p>
                                    <p className="text-sm">Search to start a new chat</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-white to-teal-50 shadow-sm">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-semibold shadow-md">
                                    {selectedConversation.participant.firstName[0]}{selectedConversation.participant.lastName[0]}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">
                                        {selectedConversation.participant.firstName} {selectedConversation.participant.lastName}
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        {selectedConversation.participant.role || (userType === 'patient' ? 'Doctor' : 'Patient')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
                            {messages.length > 0 ? (
                                <div className="space-y-4">
                                    {messages.map(msg => {
                                        const isSender = msg.senderId === userId;
                                        const messageTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        return (
                                            <div key={msg.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`flex flex-col max-w-xs lg:max-w-md xl:max-w-lg ${isSender ? 'items-end' : 'items-start'}`}>
                                                    <div className={`px-4 py-3 rounded-2xl shadow-md ${
                                                        isSender 
                                                            ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-br-sm' 
                                                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                                                    }`}>
                                                        <p className="break-words">{msg.content}</p>
                                                    </div>
                                                    <span className="text-xs text-gray-500 mt-1 px-2">{messageTime}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <div className="text-center">
                                        <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <p className="text-lg font-medium">No messages yet</p>
                                        <p className="text-sm">Start the conversation!</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex items-end space-x-3">
                                <div className="flex-1 relative">
                                    <textarea
                                        rows={1}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition-all duration-300 shadow-sm"
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                                <svg className="h-12 w-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Welcome to Chat</h3>
                            <p className="text-gray-500">Select a conversation from the sidebar to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
