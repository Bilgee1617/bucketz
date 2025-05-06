//command to display my dm's in terminal
//INSTAGRAM_DATA_PATH=/Users/bilgeebatsaikhan/Downloads/instagram-bilee/your_instagram_activity/messages/inbox npm run test-parser


// scripts/test-parser.ts
const fs = require('fs');
const path = require('path');

// Point directly to the inbox folder which contains all the conversations
const INSTAGRAM_DATA_PATH = process.env.INSTAGRAM_DATA_PATH || '/Users/bilgeebatsaikhan/Downloads/instagram-bilee/your_instagram_activity/messages/inbox';

async function findConversationFiles(directoryPath: any) {
  const result = [];
  
  try {
    // Get all subdirectories in the inbox folder (each representing a conversation)
    const entries = await fs.promises.readdir(directoryPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const conversationDir = path.join(directoryPath, entry.name);
        
        // Look for JSON files in this conversation directory
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
    console.error(`Error reading inbox directory ${directoryPath}:`, error);
  }
  
  return result;
}

async function readInstagramJson(filePath:any) {
  try {
    const rawData = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Function to format date from timestamp
function formatDate(timestamp:any) {
  return new Date(timestamp).toLocaleString();
}

// Helper function to get a summary of a conversation
function getConversationSummary(conversation: { participants: any[]; messages: string | any[]; title: any; }, filePath: string) {
  // Extract the conversation folder name from the path
  const parts = filePath.split(path.sep);
  const folderName = parts[parts.length - 2]; // Get the parent folder name
  
  let participantsStr = 'Unknown';
  if (conversation.participants && Array.isArray(conversation.participants)) {
    participantsStr = conversation.participants.map(p => p.name).join(', ');
  }
  
  let messageCount = 0;
  let firstMessageDate = 'Unknown';
  let lastMessageDate = 'Unknown';
  
  if (conversation.messages && Array.isArray(conversation.messages)) {
    messageCount = conversation.messages.length;
    
    if (messageCount > 0) {
      // In Instagram exports, messages are typically in reverse chronological order
      // (newest first), so first message is at the end of the array
      lastMessageDate = formatDate(conversation.messages[0].timestamp_ms);
      firstMessageDate = formatDate(conversation.messages[messageCount - 1].timestamp_ms);
    }
  }
  
  return {
    folderName,
    title: conversation.title || folderName,
    participants: participantsStr,
    messageCount,
    firstMessageDate,
    lastMessageDate
  };
}

async function processAllConversations(directoryPath: string) {
  const filePaths = await findConversationFiles(directoryPath);
  console.log(`Found ${filePaths.length} conversation JSON files:`);
  
  // Print all found JSON files
  filePaths.forEach(file => {
    console.log(`- ${file}`);
  });
  
  const conversations = [];
  
  for (const filePath of filePaths) {
    const data = await readInstagramJson(filePath);
    if (data) {
      conversations.push({
        data,
        filePath
      });
    }
  }
  
  return conversations;
}

async function main() {
  console.log(`Reading Instagram conversations from: ${INSTAGRAM_DATA_PATH}`);
  
  // Check if directory exists
  if (!fs.existsSync(INSTAGRAM_DATA_PATH)) {
    console.error(`Directory does not exist: ${INSTAGRAM_DATA_PATH}`);
    process.exit(1);
  }
  
  // Process all conversations
  const conversations = await processAllConversations(INSTAGRAM_DATA_PATH);
  console.log(`Successfully processed ${conversations.length} conversations`);
  
  if (conversations.length > 0) {
    // Print summaries of all conversations
    console.log('\nConversation Summaries:');
    conversations.forEach((conv, index) => {
      const summary = getConversationSummary(conv.data, conv.filePath);
      console.log(`\n--- Conversation ${index + 1} ---`);
      console.log(`Folder: ${summary.folderName}`);
      console.log(`Title: ${summary.title}`);
      console.log(`Participants: ${summary.participants}`);
      console.log(`Messages: ${summary.messageCount}`);
      console.log(`First Message: ${summary.firstMessageDate}`);
      console.log(`Last Message: ${summary.lastMessageDate}`);
      
      // For the first conversation, show a sample message
      if (index === 0 && conv.data.messages && conv.data.messages.length > 0) {
        console.log('\nSample Message:');
        const sampleMsg = conv.data.messages[0];
        console.log(`From: ${sampleMsg.sender_name}`);
        console.log(`Time: ${formatDate(sampleMsg.timestamp_ms)}`);
        console.log(`Content: ${sampleMsg.content || '(No text content)'}`);
        
        // Check if message has photos or other media
        if (sampleMsg.photos && sampleMsg.photos.length > 0) {
          console.log(`Has Photos: ${sampleMsg.photos.length}`);
        }
        
        if (sampleMsg.videos && sampleMsg.videos.length > 0) {
          console.log(`Has Videos: ${sampleMsg.videos.length}`);
        }
      }
    });
    
    // Save a summary to a file for review
    const summaryPath = path.join(process.cwd(), 'conversation-summary.json');
    const summaries = conversations.map((conv, index) => ({
      index,
      ...getConversationSummary(conv.data, conv.filePath)
    }));
    
    fs.writeFileSync(summaryPath, JSON.stringify(summaries, null, 2));
    console.log(`\nSaved conversation summaries to: ${summaryPath}`);
  }
}

main().catch(console.error);