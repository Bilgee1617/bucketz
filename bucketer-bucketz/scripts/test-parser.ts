// scripts/test-parser.ts
const fs = require('fs');
const path = require('path');

// Set this to your Instagram data directory
const INSTAGRAM_DATA_PATH = process.env.INSTAGRAM_DATA_PATH || path.join(process.cwd(), 'data/instagram');

// This function recursively finds all JSON files in the directory and its subdirectories
async function findConversationFiles(directoryPath: any) {
  const result: any[] = [];
  
  // Helper function to recursively scan directories
  async function scanDirectory(dirPath: any) {
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

async function readInstagramJson(filePath: any) {
  try {
    const rawData = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

async function processAllConversations(directoryPath: any) {
  const filePaths = await findConversationFiles(directoryPath);
  console.log(`Found ${filePaths.length} JSON files`);
  
  const conversations = [];
  
  for (const filePath of filePaths) {
    const conversation = await readInstagramJson(filePath);
    if (conversation) {
      conversations.push(conversation);
    }
  }
  
  return conversations;
}

// Function to format date from timestamp
function formatDate(timestamp: string | number | Date) {
  return new Date(timestamp).toLocaleString();
}

// Helper function to get a summary of a conversation
function getConversationSummary(conversation: { participants: any[]; messages: string | any[]; title: any; thread_path: any; }) {
  const participantsStr = conversation.participants 
    ? conversation.participants.map((p: { name: any; }) => p.name).join(', ') 
    : 'Unknown';
  
  const messageCount = conversation.messages ? conversation.messages.length : 0;
  
  const firstMessageDate = (conversation.messages && conversation.messages.length > 0) 
    ? formatDate(conversation.messages[conversation.messages.length - 1].timestamp_ms)
    : 'Unknown';
    
  const lastMessageDate = (conversation.messages && conversation.messages.length > 0) 
    ? formatDate(conversation.messages[0].timestamp_ms) 
    : 'Unknown';
  
  return {
    title: conversation.title || 'Untitled Conversation',
    participants: participantsStr,
    messageCount,
    firstMessageDate,
    lastMessageDate,
    threadPath: conversation.thread_path || 'Unknown',
  };
}

async function main() {
  console.log(`Reading Instagram data from: ${INSTAGRAM_DATA_PATH}`);
  
  // Check if directory exists
  if (!fs.existsSync(INSTAGRAM_DATA_PATH)) {
    console.error(`Directory does not exist: ${INSTAGRAM_DATA_PATH}`);
    process.exit(1);
  }
  
  // First, just test finding the files
  console.log("Scanning for JSON files...");
  const files = await findConversationFiles(INSTAGRAM_DATA_PATH);
  console.log(`Found ${files.length} JSON files:`);
  
  // Print the first 5 files paths (or less if fewer files)
  files.slice(0, 5).forEach(file => {
    console.log(`- ${file}`);
  });
  
  if (files.length > 5) {
    console.log(`... and ${files.length - 5} more`);
  }
  
  // Now process the conversations
  console.log("\nProcessing conversations...");
  const conversations = await processAllConversations(INSTAGRAM_DATA_PATH);
  console.log(`Successfully processed ${conversations.length} conversations`);
  
  if (conversations.length > 0) {
    // Print summaries of all conversations
    console.log('\nConversation Summaries:');
    conversations.forEach((conversation, index) => {
      const summary = getConversationSummary(conversation);
      console.log(`\n--- Conversation ${index + 1} ---`);
      console.log(`Title: ${summary.title}`);
      console.log(`Participants: ${summary.participants}`);
      console.log(`Messages: ${summary.messageCount}`);
      console.log(`First Message: ${summary.firstMessageDate}`);
      console.log(`Last Message: ${summary.lastMessageDate}`);
      
      if (conversation.messages && conversation.messages.length > 0) {
        // Print first message sample
        const firstMessage = conversation.messages[conversation.messages.length - 1];
        console.log('\nFirst Message Sample:');
        console.log(`From: ${firstMessage.sender_name}`);
        console.log(`Time: ${new Date(firstMessage.timestamp_ms).toLocaleString()}`);
        console.log(`Content: ${firstMessage.content || '(No text content)'}`);
        
        // Check if message has photos
        if (firstMessage.photos && firstMessage.photos.length > 0) {
          console.log(`Has Photos: ${firstMessage.photos.length}`);
        }
        
        // Check if message has videos
        if (firstMessage.videos && firstMessage.videos.length > 0) {
          console.log(`Has Videos: ${firstMessage.videos.length}`);
        }
      }
    });
    
    // Save a summary to a file for review
    const summaryPath = path.join(process.cwd(), 'conversation-summary.json');
    const summaries = conversations.map((conv, index) => ({
      index,
      ...getConversationSummary(conv)
    }));
    
    fs.writeFileSync(summaryPath, JSON.stringify(summaries, null, 2));
    console.log(`\nSaved conversation summaries to: ${summaryPath}`);
  }
}

main().catch(console.error);