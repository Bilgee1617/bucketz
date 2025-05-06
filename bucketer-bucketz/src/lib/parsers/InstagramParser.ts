//AI generated. This file loops through all directories recursively in order to find all files
//with the word messages or conversation in the name. 
//And then uses the interface I created in types to extract the data
import fs from 'fs';
import path from 'path';
import { InstagramConversation } from '@/types/instagram';

export async function readInstagramJson(filePath: string): Promise<InstagramConversation | null> {
  try {
    const rawData = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(rawData) as InstagramConversation;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// This function recursively finds all JSON files in the directory and its subdirectories
export async function findConversationFiles(directoryPath: string): Promise<string[]> {
  const result: string[] = [];
  
  // Helper function to recursively scan directories
  async function scanDirectory(dirPath: string) {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          await scanDirectory(fullPath);
        } else if (entry.isFile() && 
                  entry.name.endsWith('.json') && 
                  (entry.name.includes('messages') || entry.name.includes('conversation'))) {
          // Add matching JSON files to the result
          result.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
    }
  }
  
  // Start the recursive scan
  await scanDirectory(directoryPath);
  return result;
}

export async function processAllConversations(directoryPath: string): Promise<InstagramConversation[]> {
  const filePaths = await findConversationFiles(directoryPath);
  console.log(`Found ${filePaths.length} JSON files`);
  
  const conversations: InstagramConversation[] = [];
  
  for (const filePath of filePaths) {
    const conversation = await readInstagramJson(filePath);
    if (conversation) {
      conversations.push(conversation);
    }
  }
  
  return conversations;
}