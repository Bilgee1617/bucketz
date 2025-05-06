import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Point to your inbox directory
const INBOX_PATH = process.env.INSTAGRAM_DATA_PATH || '/Users/bilgeebatsaikhan/Downloads/instagram-bilee/your_instagram_activity/messages/inbox';

// Helper function to format date
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

// Find all conversation JSON files
async function findConversationFiles(): Promise<string[]> {
  const result: string[] = [];
  
  try {
    const entries = await fs.promises.readdir(INBOX_PATH, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const conversationDir = path.join(INBOX_PATH, entry.name);
        
        try {
          const files = await fs.promises.readdir(conversationDir, { withFileTypes: true });
          
          for (const file of files) {
            if (file.isFile() && file.name.endsWith('.json') && file.name.startsWith('message_')) {
              result.push(path.join(conversationDir, file.name));
            }
          }
        } catch (error) {
          console.error(`Error reading conversation directory ${conversationDir}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading inbox directory ${INBOX_PATH}:`, error);
  }
  
  return result;
}

// Read and parse a JSON file
async function readInstagramJson(filePath: string): Promise<any> {
  try {
    const rawData = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Get a summary of a conversation
function getConversationSummary(conversation: any, filePath: string) {
  // Extract the conversation folder name from the path
  const parts = filePath.split(path.sep);
  const folderName = parts[parts.length - 2]; // Get the parent folder name
  
  let participantsStr = 'Unknown';
  if (conversation.participants && Array.isArray(conversation.participants)) {
    participantsStr = conversation.participants.map((p: any) => p.name).join(', ');
  }
  
  let messageCount = 0;
  let firstMessageDate = 'Unknown';
  let lastMessageDate = 'Unknown';
  
  if (conversation.messages && Array.isArray(conversation.messages)) {
    messageCount = conversation.messages.length;
    
    if (messageCount > 0) {
      lastMessageDate = formatDate(conversation.messages[0].timestamp_ms);
      firstMessageDate = formatDate(conversation.messages[messageCount - 1].timestamp_ms);
    }
  }
  
  return {
    id: folderName,
    folderName,
    title: conversation.title || folderName,
    participants: participantsStr,
    messageCount,
    firstMessageDate,
    lastMessageDate
  };
}

export async function GET() {
  try {
    const filePaths = await findConversationFiles();
    const conversations = [];
    
    for (const filePath of filePaths) {
      const data = await readInstagramJson(filePath);
      if (data) {
        conversations.push({
          ...getConversationSummary(data, filePath),
          filePath
        });
      }
    }
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}