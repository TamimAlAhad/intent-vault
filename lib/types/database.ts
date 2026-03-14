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
      profiles: {
        Row: {
          id: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          email?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      saved_items: {
        Row: {
          id: string;
          user_id: string;
          item_type: "image" | "url" | "text";
          original_text: string | null;
          original_url: string | null;
          image_path: string | null;
          ocr_text: string | null;
          ai_title: string;
          ai_summary: string;
          detected_intent: string;
          category: string | null;
          suggested_action: string | null;
          reminder_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_type: "image" | "url" | "text";
          original_text?: string | null;
          original_url?: string | null;
          image_path?: string | null;
          ocr_text?: string | null;
          ai_title: string;
          ai_summary: string;
          detected_intent: string;
          category?: string | null;
          suggested_action?: string | null;
          reminder_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          original_text?: string | null;
          original_url?: string | null;
          image_path?: string | null;
          ocr_text?: string | null;
          ai_title?: string;
          ai_summary?: string;
          detected_intent?: string;
          category?: string | null;
          suggested_action?: string | null;
          reminder_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
