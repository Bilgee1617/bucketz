// src/app/conversation/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Message {
  sender_name: string;
  timestamp_ms: number;
  content?: string;
  photos?: { uri: string }[];
  videos?: { uri: string }[];
  reactions?: { reaction: string; actor: string }[];
}

interface Conversation {
  participants: { name: string }[];
  messages: Message[];
  title?: string;
  thread_path?: string;
}

export default function ConversationPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchConversation() {
      try {
        const response = await fetch(`/api/conversations/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch conversation');
        }
        
        const data = await response.json();
        setConversation(data.conversation);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    }
    
    fetchConversation();
  }, [id]);
  
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p className="text-xl">Loading conversation...</p>
      </main>
    );
  }
  
  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p className="text-xl">Error: {error}</p>
        <Link href="/" className="mt-4">
          Back to Conversations
        </Link>
      </main>
    );
  }
  
  if (!conversation) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p className="text-xl">Conversation not found</p>
        <Link href="/" className="mt-4">
          Back to Conversations
        </Link>
      </main>
    );
  }
  
  // Function to format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-4xl">
        <Link href="/" className="mb-4 block">
          ← Back to Conversations
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">
          {conversation.title || 'Untitled Conversation'}
        </h1>
        
        <p className="mb-6">
          Participants: {conversation.participants.map(p => p.name).join(', ')}
        </p>
        
        <div className="border border-gray-300 rounded p-4 mb-6">
          <h2 className="text-xl font-bold mb-2">Conversation Stats</h2>
          <p>Total Messages: {conversation.messages.length}</p>
          <p>First Message: {formatDate(conversation.messages[conversation.messages.length - 1]?.timestamp_ms)}</p>
          <p>Last Message: {formatDate(conversation.messages[0]?.timestamp_ms)}</p>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Messages</h2>
        
        <div className="border border-gray-300 rounded overflow-hidden mb-4">
          {/* Display pagination for large conversations */}
          <div className="bg-gray-100 p-3 border-b border-gray-300">
            Showing most recent 100 of {conversation.messages.length} messages
          </div>
          
          {/* Display messages in reverse chronological order (newest first) */}
          {conversation.messages.slice(0, 100).map((message, index) => (
            <div 
              key={index} 
              className={`p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-300`}
            >
              <div className="flex justify-between mb-1">
                <p className="font-bold">{message.sender_name}</p>
                <p className="text-sm text-gray-500">{formatDate(message.timestamp_ms)}</p>
              </div>
              
              <p className="mb-2">{message.content || '(No text content)'}</p>
              
              {/* Show media indicators */}
              {message.photos && message.photos.length > 0 && (
                <p className="text-sm text-gray-500">📷 {message.photos.length} photo(s)</p>
              )}
              
              {message.videos && message.videos.length > 0 && (
                <p className="text-sm text-gray-500">🎥 {message.videos.length} video(s)</p>
              )}
              
              {/* Show reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <div className="mt-1 text-sm">
                  <span className="text-gray-500">Reactions: </span>
                  {message.reactions.map((reaction, i) => (
                    <span key={i} className="mr-2">
                      {reaction.reaction} by {reaction.actor}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}