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
          username: string
          display_name: string | null
          bio: string | null
          hobbies: string[] | null
          skills: string[] | null
          teaching_interest: boolean
          volunteer_interest: boolean
          hobby_groups: string[] | null
          level: number
          created_at: string
          privacy: {
            showEmail: boolean
            showLocation: boolean
            showSocial: boolean
            showFullName: boolean
          }
          social: {
            twitter?: string
            instagram?: string
            linkedin?: string
            website?: string
          }
        }
        Insert: {
          id?: string
          email: string
          username: string
          display_name?: string | null
          bio?: string | null
          hobbies?: string[] | null
          skills?: string[] | null
          teaching_interest?: boolean
          volunteer_interest?: boolean
          hobby_groups?: string[] | null
          level?: number
          created_at?: string
          privacy?: {
            showEmail: boolean
            showLocation: boolean
            showSocial: boolean
            showFullName: boolean
          }
          social?: {
            twitter?: string
            instagram?: string
            linkedin?: string
            website?: string
          }
        }
        Update: {
          id?: string
          email?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          hobbies?: string[] | null
          skills?: string[] | null
          teaching_interest?: boolean
          volunteer_interest?: boolean
          hobby_groups?: string[] | null
          level?: number
          created_at?: string
          privacy?: {
            showEmail: boolean
            showLocation: boolean
            showSocial: boolean
            showFullName: boolean
          }
          social?: {
            twitter?: string
            instagram?: string
            linkedin?: string
            website?: string
          }
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