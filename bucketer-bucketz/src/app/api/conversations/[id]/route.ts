import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Point to your inbox directory
const INBOX_PATH = process.env.INSTAGRAM_DATA_PATH || '/Users/bilgeebatsaikhan/Downloads/instagram-bilee/your_instagram_activity/messages/inbox';

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

// Find conversation file by ID (folder name)
async function findConversationFile(id: string): Promise<string | null> {
  const conversationDir = path.join(INBOX_PATH, id);
  
  try {
    if (!fs.existsSync(conversationDir)) {
      return null;
    }
    
    const files = await fs.promises.readdir(conversationDir, { withFileTypes: true });
    
    for (const file of files) {
      if (file.isFile() && file.name.endsWith('.json') && file.name.startsWith('message_')) {
        return path.join(conversationDir, file.name);
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error finding conversation file for ${id}:`, error);
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing conversation ID' },
        { status: 400 }
      );
    }
    
    const filePath = await findConversationFile(id);
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    const conversation = await readInstagramJson(filePath);
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Failed to read conversation data' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ conversation, filePath });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}