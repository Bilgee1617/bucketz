//creating the interfaces/formatting to extract from the json files properly.
export interface InstagramMessage {
    sender_name: string;
    timestamp_ms: number;
    content?: string;
    photos?: {
      uri: string;
      creation_timestamp: number;
    }[];
    videos?: {
      uri: string;
      creation_timestamp: number;
    }[];
    reactions?: {
      reaction: string;
      actor: string;
    }[];
  }
  
  export interface InstagramConversation {
    participants: {
      name: string;
    }[];
    messages: InstagramMessage[];
    title: string;
    is_still_participant: boolean;
    thread_path: string;
    magic_words: string[];
    image?: {
      uri: string;
      creation_timestamp: number;
    };
  }
  
