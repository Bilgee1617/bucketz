// src/types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_id: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          auth_id?: string;
          email?: string;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          conversation_id: string;
          participants: Json;
          title: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          conversation_id: string;
          participants: Json;
          title?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          conversation_id?: string;
          participants?: Json;
          title?: string | null;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender: string;
          content: string | null;
          timestamp: string;
          media_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender: string;
          content?: string | null;
          timestamp: string;
          media_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender?: string;
          content?: string | null;
          timestamp?: string;
          media_url?: string | null;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      message_categories: {
        Row: {
          message_id: string;
          category_id: string;
          confidence: number | null;
        };
        Insert: {
          message_id: string;
          category_id: string;
          confidence?: number | null;
        };
        Update: {
          message_id?: string;
          category_id?: string;
          confidence?: number | null;
        };
      };
    };
  };
}