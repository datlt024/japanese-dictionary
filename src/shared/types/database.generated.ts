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
      grammars: {
        Row: {
          created_at: string
          differences: Json
          examples: Json
          explanation_en: string | null
          explanation_vi: string | null
          formation: Json
          frequency: string
          id: number
          is_common: boolean
          jlpt_level: string
          meaning_en: string | null
          meaning_vi: string
          notes: Json
          nuance_vi: string | null
          pattern: string
          reading: string | null
          short_meaning_vi: string | null
          similar_grammar: Json
          tags: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          differences?: Json
          examples?: Json
          explanation_en?: string | null
          explanation_vi?: string | null
          formation?: Json
          frequency?: string
          id?: never
          is_common?: boolean
          jlpt_level: string
          meaning_en?: string | null
          meaning_vi: string
          notes?: Json
          nuance_vi?: string | null
          pattern: string
          reading?: string | null
          short_meaning_vi?: string | null
          similar_grammar?: Json
          tags?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          differences?: Json
          examples?: Json
          explanation_en?: string | null
          explanation_vi?: string | null
          formation?: Json
          frequency?: string
          id?: never
          is_common?: boolean
          jlpt_level?: string
          meaning_en?: string | null
          meaning_vi?: string
          notes?: Json
          nuance_vi?: string | null
          pattern?: string
          reading?: string | null
          short_meaning_vi?: string | null
          similar_grammar?: Json
          tags?: Json
          updated_at?: string
        }
        Relationships: []
      }
      kanji_radicals: {
        Row: {
          created_at: string | null
          id: number
          meaning_en: string | null
          meaning_vi: string | null
          radical: string
          stroke_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          meaning_en?: string | null
          meaning_vi?: string | null
          radical: string
          stroke_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          meaning_en?: string | null
          meaning_vi?: string | null
          radical?: string
          stroke_count?: number | null
        }
        Relationships: []
      }
      kanji_vocabulary_links: {
        Row: {
          id: number
          kanji_id: number
          priority: number | null
          vocabulary_id: number
        }
        Insert: {
          id?: number
          kanji_id: number
          priority?: number | null
          vocabulary_id: number
        }
        Update: {
          id?: number
          kanji_id?: number
          priority?: number | null
          vocabulary_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "kanji_vocabulary_links_kanji_id_fkey"
            columns: ["kanji_id"]
            isOneToOne: false
            referencedRelation: "kanjis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanji_vocabulary_links_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabularies"
            referencedColumns: ["id"]
          },
        ]
      }
      kanjis: {
        Row: {
          created_at: string | null
          frequency: number | null
          grade: number | null
          id: number
          jlpt: number | null
          kanji: string
          kunyomi: string | null
          meaning_en: string | null
          meaning_vi: string | null
          onyomi: string | null
          radical_id: number | null
          stroke_count: number | null
          unicode: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          frequency?: number | null
          grade?: number | null
          id?: never
          jlpt?: number | null
          kanji: string
          kunyomi?: string | null
          meaning_en?: string | null
          meaning_vi?: string | null
          onyomi?: string | null
          radical_id?: number | null
          stroke_count?: number | null
          unicode?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          frequency?: number | null
          grade?: number | null
          id?: never
          jlpt?: number | null
          kanji?: string
          kunyomi?: string | null
          meaning_en?: string | null
          meaning_vi?: string | null
          onyomi?: string | null
          radical_id?: number | null
          stroke_count?: number | null
          unicode?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_kanjis_radical"
            columns: ["radical_id"]
            isOneToOne: false
            referencedRelation: "kanji_radicals"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabularies: {
        Row: {
          created_at: string | null
          id: number
          is_common: boolean | null
          jlpt: string | null
          jmdict_id: string | null
          old_id: number | null
          primary_kana: string | null
          primary_word: string
          romaji: string | null
          source: string | null
          updated_at: string | null
          verb_group: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_common?: boolean | null
          jlpt?: string | null
          jmdict_id?: string | null
          old_id?: number | null
          primary_kana?: string | null
          primary_word: string
          romaji?: string | null
          source?: string | null
          updated_at?: string | null
          verb_group?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_common?: boolean | null
          jlpt?: string | null
          jmdict_id?: string | null
          old_id?: number | null
          primary_kana?: string | null
          primary_word?: string
          romaji?: string | null
          source?: string | null
          updated_at?: string | null
          verb_group?: string | null
        }
        Relationships: []
      }
      vocabularies_old: {
        Row: {
          created_at: string | null
          frequency: number | null
          id: number
          is_common: boolean | null
          jlpt: string | null
          jmdict_id: string | null
          kana: string | null
          meaning_en: string | null
          meaning_vi: string | null
          part_of_speech: string | null
          word: string
        }
        Insert: {
          created_at?: string | null
          frequency?: number | null
          id?: never
          is_common?: boolean | null
          jlpt?: string | null
          jmdict_id?: string | null
          kana?: string | null
          meaning_en?: string | null
          meaning_vi?: string | null
          part_of_speech?: string | null
          word: string
        }
        Update: {
          created_at?: string | null
          frequency?: number | null
          id?: never
          is_common?: boolean | null
          jlpt?: string | null
          jmdict_id?: string | null
          kana?: string | null
          meaning_en?: string | null
          meaning_vi?: string | null
          part_of_speech?: string | null
          word?: string
        }
        Relationships: []
      }
      vocabulary_examples: {
        Row: {
          created_at: string | null
          id: number
          quality_status: string | null
          ruby: Json | null
          sense_id: number | null
          sentence_jp: string
          sentence_vi: string | null
          source: string | null
          vocabulary_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          quality_status?: string | null
          ruby?: Json | null
          sense_id?: number | null
          sentence_jp: string
          sentence_vi?: string | null
          source?: string | null
          vocabulary_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          quality_status?: string | null
          ruby?: Json | null
          sense_id?: number | null
          sentence_jp?: string
          sentence_vi?: string | null
          source?: string | null
          vocabulary_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_examples_sense_id_fkey"
            columns: ["sense_id"]
            isOneToOne: false
            referencedRelation: "vocabulary_senses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vocabulary_examples_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabularies"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_frequencies: {
        Row: {
          created_at: string | null
          frequency_rank: number | null
          frequency_score: number | null
          id: number
          source: string
          vocabulary_id: number | null
        }
        Insert: {
          created_at?: string | null
          frequency_rank?: number | null
          frequency_score?: number | null
          id?: number
          source: string
          vocabulary_id?: number | null
        }
        Update: {
          created_at?: string | null
          frequency_rank?: number | null
          frequency_score?: number | null
          id?: number
          source?: string
          vocabulary_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_frequencies_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabularies"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_readings: {
        Row: {
          created_at: string | null
          id: number
          info: string[] | null
          is_primary: boolean | null
          priority: number | null
          reading: string
          romaji: string | null
          vocabulary_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          info?: string[] | null
          is_primary?: boolean | null
          priority?: number | null
          reading: string
          romaji?: string | null
          vocabulary_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          info?: string[] | null
          is_primary?: boolean | null
          priority?: number | null
          reading?: string
          romaji?: string | null
          vocabulary_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_readings_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabularies"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_relations: {
        Row: {
          created_at: string | null
          id: number
          note_vi: string | null
          related_vocabulary_id: number | null
          relation_type: string
          source: string | null
          status: string | null
          vocabulary_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          note_vi?: string | null
          related_vocabulary_id?: number | null
          relation_type: string
          source?: string | null
          status?: string | null
          vocabulary_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          note_vi?: string | null
          related_vocabulary_id?: number | null
          relation_type?: string
          source?: string | null
          status?: string | null
          vocabulary_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_relations_related_vocabulary_id_fkey"
            columns: ["related_vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabularies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vocabulary_relations_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabularies"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_search_index: {
        Row: {
          kana_text: string | null
          meaning_en_text: string | null
          meaning_vi_text: string | null
          priority_score: number | null
          romaji_text: string | null
          search_text: string | null
          updated_at: string | null
          vocabulary_id: number
          word_text: string | null
        }
        Insert: {
          kana_text?: string | null
          meaning_en_text?: string | null
          meaning_vi_text?: string | null
          priority_score?: number | null
          romaji_text?: string | null
          search_text?: string | null
          updated_at?: string | null
          vocabulary_id: number
          word_text?: string | null
        }
        Update: {
          kana_text?: string | null
          meaning_en_text?: string | null
          meaning_vi_text?: string | null
          priority_score?: number | null
          romaji_text?: string | null
          search_text?: string | null
          updated_at?: string | null
          vocabulary_id?: number
          word_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_search_index_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: true
            referencedRelation: "vocabularies"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_senses: {
        Row: {
          created_at: string | null
          field: string[] | null
          id: number
          info: string[] | null
          meaning_en: string | null
          meaning_vi: string | null
          meaning_vi_status: string | null
          misc: string[] | null
          part_of_speech: string[] | null
          sense_index: number
          updated_at: string | null
          vocabulary_id: number | null
        }
        Insert: {
          created_at?: string | null
          field?: string[] | null
          id?: number
          info?: string[] | null
          meaning_en?: string | null
          meaning_vi?: string | null
          meaning_vi_status?: string | null
          misc?: string[] | null
          part_of_speech?: string[] | null
          sense_index?: number
          updated_at?: string | null
          vocabulary_id?: number | null
        }
        Update: {
          created_at?: string | null
          field?: string[] | null
          id?: number
          info?: string[] | null
          meaning_en?: string | null
          meaning_vi?: string | null
          meaning_vi_status?: string | null
          misc?: string[] | null
          part_of_speech?: string[] | null
          sense_index?: number
          updated_at?: string | null
          vocabulary_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_senses_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabularies"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_writings: {
        Row: {
          created_at: string | null
          id: number
          info: string[] | null
          is_primary: boolean | null
          priority: number | null
          vocabulary_id: number | null
          writing: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          info?: string[] | null
          is_primary?: boolean | null
          priority?: number | null
          vocabulary_id?: number | null
          writing: string
        }
        Update: {
          created_at?: string | null
          id?: number
          info?: string[] | null
          is_primary?: boolean | null
          priority?: number | null
          vocabulary_id?: number | null
          writing?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_writings_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabularies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_kanji_related_words_rpc: {
        Args: { search_kanji: string }
        Returns: {
          id: number
          kana: string
          meaning_en: string
          meaning_vi: string
          priority: number
          word: string
        }[]
      }
      get_related_vocabularies_rpc: {
        Args: { search_keyword: string }
        Returns: {
          id: number
          kana: string
          meaning: string
          priority_score: number
          word: string
        }[]
      }
      search_kanji_reading_words_rpc: {
        Args: { search_kanji: string; search_reading: string }
        Returns: {
          id: number
          kana: string
          meaning_en: string
          meaning_vi: string
          word: string
        }[]
      }
      search_vocabularies_rpc: {
        Args: { search_keyword: string }
        Returns: {
          id: number
          is_common: boolean
          jlpt: string
          kana: string[]
          meaning: string
          priority_score: number
          verb_group: string
          word: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
