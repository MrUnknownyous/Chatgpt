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
          tz: string | null;
          widgets: Json | null;
        };
        Insert: {
          id?: string;
          email?: string | null;
          tz?: string | null;
          widgets?: Json | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          tz?: string | null;
          widgets?: Json | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          due_date: string | null;
          status: string;
          created_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          due_date?: string | null;
          status?: string;
          created_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          due_date?: string | null;
          status?: string;
          created_at?: string | null;
          completed_at?: string | null;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          goal_per_day: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          goal_per_day?: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          goal_per_day?: number;
          created_at?: string | null;
        };
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          ts: string;
          qty: number;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          ts?: string;
          qty?: number;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          ts?: string;
          qty?: number;
        };
      };
      moods: {
        Row: {
          id: string;
          user_id: string;
          ts: string | null;
          score: number | null;
          note: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          ts?: string | null;
          score?: number | null;
          note?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          ts?: string | null;
          score?: number | null;
          note?: string | null;
        };
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          ts: string | null;
          bodypart: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          ts?: string | null;
          bodypart?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          ts?: string | null;
          bodypart?: string | null;
          notes?: string | null;
        };
      };
      workout_sets: {
        Row: {
          id: string;
          workout_id: string;
          lift: string | null;
          weight: number | null;
          reps: number | null;
        };
        Insert: {
          id?: string;
          workout_id: string;
          lift?: string | null;
          weight?: number | null;
          reps?: number | null;
        };
        Update: {
          id?: string;
          workout_id?: string;
          lift?: string | null;
          weight?: number | null;
          reps?: number | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
