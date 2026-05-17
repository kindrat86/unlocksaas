export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ab_tests: {
        Row: {
          conversion_event: string | null
          id: string
          key: string
          recorded_at: string
          subject_id: string | null
          variant: string
        }
        Insert: {
          conversion_event?: string | null
          id?: string
          key: string
          recorded_at?: string
          subject_id?: string | null
          variant: string
        }
        Update: {
          conversion_event?: string | null
          id?: string
          key?: string
          recorded_at?: string
          subject_id?: string | null
          variant?: string
        }
        Relationships: []
      }
      billing_events: {
        Row: {
          event_type: string
          payload: Json | null
          processed_at: string
          stripe_event_id: string
        }
        Insert: {
          event_type: string
          payload?: Json | null
          processed_at?: string
          stripe_event_id: string
        }
        Update: {
          event_type?: string
          payload?: Json | null
          processed_at?: string
          stripe_event_id?: string
        }
        Relationships: []
      }
      billing_payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          email: string
          failed_at: string | null
          id: string
          kind: string
          paid_at: string | null
          profile_id: string | null
          refund_amount_cents: number | null
          refunded_at: string | null
          status: string
          stripe_charge_id: string | null
          stripe_customer_id: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          email: string
          failed_at?: string | null
          id?: string
          kind: string
          paid_at?: string | null
          profile_id?: string | null
          refund_amount_cents?: number | null
          refunded_at?: string | null
          status: string
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          email?: string
          failed_at?: string | null
          id?: string
          kind?: string
          paid_at?: string | null
          profile_id?: string | null
          refund_amount_cents?: number | null
          refunded_at?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_payments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "builder_badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_payments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_leads: {
        Row: {
          biggest_attempt: string | null
          bucket: string | null
          converted_session_id: string | null
          converted_to_starter_at: string | null
          created_at: string
          email: string
          evidence: string | null
          explanation: string | null
          headline: string | null
          id: string
          identity_variant: string | null
          ip: string | null
          is_returning: boolean
          label: string
          next_step: string | null
          product_url: string
          recent_revenue: string | null
          source: string | null
          subscriber_id: string | null
          time_since_launch: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          biggest_attempt?: string | null
          bucket?: string | null
          converted_session_id?: string | null
          converted_to_starter_at?: string | null
          created_at?: string
          email: string
          evidence?: string | null
          explanation?: string | null
          headline?: string | null
          id?: string
          identity_variant?: string | null
          ip?: string | null
          is_returning?: boolean
          label: string
          next_step?: string | null
          product_url: string
          recent_revenue?: string | null
          source?: string | null
          subscriber_id?: string | null
          time_since_launch?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          biggest_attempt?: string | null
          bucket?: string | null
          converted_session_id?: string | null
          converted_to_starter_at?: string | null
          created_at?: string
          email?: string
          evidence?: string | null
          explanation?: string | null
          headline?: string | null
          id?: string
          identity_variant?: string | null
          ip?: string | null
          is_returning?: boolean
          label?: string
          next_step?: string | null
          product_url?: string
          recent_revenue?: string | null
          source?: string | null
          subscriber_id?: string | null
          time_since_launch?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_leads_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "soap_opera_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_100_entries: {
        Row: {
          audience_size: number | null
          category: number
          created_at: string
          handle: string | null
          id: string
          name: string
          notes: string | null
          platform: string | null
          project_id: string
          relevance_score: number | null
          source: string
          updated_at: string
          url: string | null
        }
        Insert: {
          audience_size?: number | null
          category: number
          created_at?: string
          handle?: string | null
          id?: string
          name: string
          notes?: string | null
          platform?: string | null
          project_id: string
          relevance_score?: number | null
          source?: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          audience_size?: number | null
          category?: number
          created_at?: string
          handle?: string | null
          id?: string
          name?: string
          notes?: string | null
          platform?: string | null
          project_id?: string
          relevance_score?: number | null
          source?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dream_100_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          achieved_at: string
          id: string
          key: string
          metadata: Json | null
          profile_id: string
          source: string
        }
        Insert: {
          achieved_at?: string
          id?: string
          key: string
          metadata?: Json | null
          profile_id: string
          source?: string
        }
        Update: {
          achieved_at?: string
          id?: string
          key?: string
          metadata?: Json | null
          profile_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "builder_badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_actions: {
        Row: {
          channel: string
          converted: boolean
          converted_at: string | null
          id: string
          message_sent: string
          project_id: string
          public_link: string | null
          responded_at: string | null
          response_received: boolean
          sent_at: string
          target_id: string | null
          verified_at: string | null
          verified_live: boolean
        }
        Insert: {
          channel: string
          converted?: boolean
          converted_at?: string | null
          id?: string
          message_sent: string
          project_id: string
          public_link?: string | null
          responded_at?: string | null
          response_received?: boolean
          sent_at?: string
          target_id?: string | null
          verified_at?: string | null
          verified_live?: boolean
        }
        Update: {
          channel?: string
          converted?: boolean
          converted_at?: string | null
          id?: string
          message_sent?: string
          project_id?: string
          public_link?: string | null
          responded_at?: string | null
          response_received?: boolean
          sent_at?: string
          target_id?: string | null
          verified_at?: string | null
          verified_live?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "outreach_actions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_actions_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "dream_100_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          builder_name: string | null
          builder_slug: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          core_started_at: string | null
          created_at: string
          email: string
          first_customer_at: string | null
          guarantee_expires_at: string | null
          id: string
          product_name: string | null
          product_url: string | null
          refunded_at: string | null
          share_visibility: string
          starter_purchased_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          tier: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          builder_name?: string | null
          builder_slug?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          core_started_at?: string | null
          created_at?: string
          email: string
          first_customer_at?: string | null
          guarantee_expires_at?: string | null
          id?: string
          product_name?: string | null
          product_url?: string | null
          refunded_at?: string | null
          share_visibility?: string
          starter_purchased_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          tier?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          builder_name?: string | null
          builder_slug?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          core_started_at?: string | null
          created_at?: string
          email?: string
          first_customer_at?: string | null
          guarantee_expires_at?: string | null
          id?: string
          product_name?: string | null
          product_url?: string | null
          refunded_at?: string | null
          share_visibility?: string
          starter_purchased_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          tier?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      project_state: {
        Row: {
          ac: Json | null
          badges_earned: string[]
          conversions: Json | null
          dream_customer: Json | null
          offer: Json | null
          outreach: Json | null
          project_id: string
          scripts: Json | null
          updated_at: string
        }
        Insert: {
          ac?: Json | null
          badges_earned?: string[]
          conversions?: Json | null
          dream_customer?: Json | null
          offer?: Json | null
          outreach?: Json | null
          project_id: string
          scripts?: Json | null
          updated_at?: string
        }
        Update: {
          ac?: Json | null
          badges_earned?: string[]
          conversions?: Json | null
          dream_customer?: Json | null
          offer?: Json | null
          outreach?: Json | null
          project_id?: string
          scripts?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_state_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          current_step: number
          guarantee_refund_eligible: boolean
          guarantee_started_at: string | null
          id: string
          identity_choice: string | null
          name: string
          niche: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_step?: number
          guarantee_refund_eligible?: boolean
          guarantee_started_at?: string | null
          id?: string
          identity_choice?: string | null
          name?: string
          niche?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_step?: number
          guarantee_refund_eligible?: boolean
          guarantee_started_at?: string | null
          id?: string
          identity_choice?: string | null
          name?: string
          niche?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_subscribers: {
        Row: {
          completed_at: string | null
          created_at: string
          email: string
          emails_sent: number
          first_name: string
          id: string
          identity_variant: string | null
          last_error: string | null
          last_reply_at: string | null
          last_sent_at: string | null
          next_send_at: string | null
          product_url: string | null
          source: string
          status: string
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          email: string
          emails_sent?: number
          first_name: string
          id?: string
          identity_variant?: string | null
          last_error?: string | null
          last_reply_at?: string | null
          last_sent_at?: string | null
          next_send_at?: string | null
          product_url?: string | null
          source?: string
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          email?: string
          emails_sent?: number
          first_name?: string
          id?: string
          identity_variant?: string | null
          last_error?: string | null
          last_reply_at?: string | null
          last_sent_at?: string | null
          next_send_at?: string | null
          product_url?: string | null
          source?: string
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      seinfeld_subscribers: {
        Row: {
          created_at: string
          current_index: number
          email: string
          id: string
          last_error: string | null
          last_sent_at: string | null
          sends_count: number
          source: string
          source_subscriber_id: string | null
          status: string
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_index?: number
          email: string
          id?: string
          last_error?: string | null
          last_sent_at?: string | null
          sends_count?: number
          source?: string
          source_subscriber_id?: string | null
          status?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_index?: number
          email?: string
          id?: string
          last_error?: string | null
          last_sent_at?: string | null
          sends_count?: number
          source?: string
          source_subscriber_id?: string | null
          status?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seinfeld_subscribers_source_subscriber_id_fkey"
            columns: ["source_subscriber_id"]
            isOneToOne: false
            referencedRelation: "soap_opera_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      soap_opera_subscribers: {
        Row: {
          bucket: string | null
          diagnostic_result: string | null
          email: string
          emails_sent: number
          id: string
          identity_variant: string | null
          last_error: string | null
          last_sent_at: string | null
          next_send_at: string | null
          source: string | null
          status: string
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          bucket?: string | null
          diagnostic_result?: string | null
          email: string
          emails_sent?: number
          id?: string
          identity_variant?: string | null
          last_error?: string | null
          last_sent_at?: string | null
          next_send_at?: string | null
          source?: string | null
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          bucket?: string | null
          diagnostic_result?: string | null
          email?: string
          emails_sent?: number
          id?: string
          identity_variant?: string | null
          last_error?: string | null
          last_sent_at?: string | null
          next_send_at?: string | null
          source?: string | null
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      stripe_connections: {
        Row: {
          connected_at: string
          disconnected_at: string | null
          project_id: string
          stripe_account_id: string
        }
        Insert: {
          connected_at?: string
          disconnected_at?: string | null
          project_id: string
          stripe_account_id: string
        }
        Update: {
          connected_at?: string
          disconnected_at?: string | null
          project_id?: string
          stripe_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_connections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      verified_conversions: {
        Row: {
          amount_cents: number
          currency: string
          customer_email: string | null
          detected_at: string
          id: string
          metadata: Json | null
          profile_id: string
          source: string
          stripe_account_id: string | null
          stripe_charge_id: string | null
        }
        Insert: {
          amount_cents: number
          currency?: string
          customer_email?: string | null
          detected_at?: string
          id?: string
          metadata?: Json | null
          profile_id: string
          source?: string
          stripe_account_id?: string | null
          stripe_charge_id?: string | null
        }
        Update: {
          amount_cents?: number
          currency?: string
          customer_email?: string | null
          detected_at?: string
          id?: string
          metadata?: Json | null
          profile_id?: string
          source?: string
          stripe_account_id?: string | null
          stripe_charge_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verified_conversions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "builder_badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verified_conversions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      builder_badges: {
        Row: {
          builder_name: string | null
          builder_slug: string | null
          first_customer_at: string | null
          id: string | null
          product_name: string | null
          product_url: string | null
          share_visibility: string | null
        }
        Insert: {
          builder_name?: string | null
          builder_slug?: string | null
          first_customer_at?: string | null
          id?: string | null
          product_name?: string | null
          product_url?: string | null
          share_visibility?: string | null
        }
        Update: {
          builder_name?: string | null
          builder_slug?: string | null
          first_customer_at?: string | null
          id?: string | null
          product_name?: string | null
          product_url?: string | null
          share_visibility?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
