// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Conversation {
  id: string;
  folderName: string;
  title: string;
  participants: string;
  messageCount: number;
  firstMessageDate: string;
  lastMessageDate: string;
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchConversations() {
      try {
        const response = await fetch('/api/conversations');
        
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        
        const data = await response.json();
        setConversations(data.conversations);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    }
    
    fetchConversations();
  }, []);
  
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p className="text-xl">Loading conversations...</p>
      </main>
    );
  }
  
  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p className="text-xl">Error: {error}</p>
      </main>
    );
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-8">DM's</h1>
      
      <div className="w-full max-w-4xl">
        <p className="mb-4">Found {conversations.length} conversations</p>
        
        {conversations.length === 0 ? (
          <p className="text-xl text-center">No conversations found</p>
        ) : (
          <div className="grid gap-4">
            {conversations
              .sort((a, b) => b.messageCount - a.messageCount) // Sort by most messages first
              .map((conversation, index) => (
                <Link 
                  key={`${conversation.id}-${index}`}
                  href={`/conversation/${conversation.id}`}
                  className="block border border-gray-300 rounded p-4"
                >
                  <h2 className="text-xl font-bold">{conversation.title}</h2>
                  <p>With: {conversation.participants}</p>
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <p>{conversation.messageCount} messages</p>
                    <p>Last active: {conversation.lastMessageDate}</p>
                  </div>
                </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}