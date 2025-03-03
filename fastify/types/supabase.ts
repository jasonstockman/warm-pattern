/**
 * This file contains TypeScript type definitions for the Supabase database schema.
 * These types represent the structure of the database tables and relationships.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          user_id: string
          plaid_item_id: string
          plaid_access_token: string
          plaid_institution_id: string
          institution_name: string
          status: string
          error: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plaid_item_id: string
          plaid_access_token: string
          plaid_institution_id: string
          institution_name: string
          status: string
          error?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plaid_item_id?: string
          plaid_access_token?: string
          plaid_institution_id?: string
          institution_name?: string
          status?: string
          error?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          item_id: string
          user_id: string
          plaid_account_id: string
          name: string
          mask: string | null
          official_name: string | null
          current_balance: number | null
          available_balance: number | null
          iso_currency_code: string | null
          account_type: string
          account_subtype: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_id: string
          user_id: string
          plaid_account_id: string
          name: string
          mask?: string | null
          official_name?: string | null
          current_balance?: number | null
          available_balance?: number | null
          iso_currency_code?: string | null
          account_type: string
          account_subtype: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          user_id?: string
          plaid_account_id?: string
          name?: string
          mask?: string | null
          official_name?: string | null
          current_balance?: number | null
          available_balance?: number | null
          iso_currency_code?: string | null
          account_type?: string
          account_subtype?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          account_id: string
          user_id: string
          plaid_transaction_id: string
          category_id: string | null
          category: string[] | null
          subcategory: string | null
          type: string | null
          name: string
          amount: number
          iso_currency_code: string | null
          date: string
          pending: boolean
          merchant_name: string | null
          payment_channel: string | null
          authorized_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          user_id: string
          plaid_transaction_id: string
          category_id?: string | null
          category?: string[] | null
          subcategory?: string | null
          type?: string | null
          name: string
          amount: number
          iso_currency_code?: string | null
          date: string
          pending: boolean
          merchant_name?: string | null
          payment_channel?: string | null
          authorized_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          user_id?: string
          plaid_transaction_id?: string
          category_id?: string | null
          category?: string[] | null
          subcategory?: string | null
          type?: string | null
          name?: string
          amount?: number
          iso_currency_code?: string | null
          date?: string
          pending?: boolean
          merchant_name?: string | null
          payment_channel?: string | null
          authorized_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          value: number
          currency: string
          institution: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          value: number
          currency: string
          institution?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          value?: number
          currency?: string
          institution?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      refresh_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          expires_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'] 