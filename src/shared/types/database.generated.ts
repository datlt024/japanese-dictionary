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
      grammar_common_pairs: {
        Row: {
          expression: string
          grammar_id: number
          id: number
        }
        Insert: {
          expression: string
          grammar_id: number
          id?: never
        }
        Update: {
          expression?: string
          grammar_id?: number
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "grammar_common_pairs_grammar_id_fkey"
            columns: ["grammar_id"]
            isOneToOne: false
            referencedRelation: "grammars"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_differences: {
        Row: {
          compared_pattern: string
          difference_text: string
          grammar_id: number
          id: number
        }
        Insert: {
          compared_pattern: string
          difference_text: string
          grammar_id: number
          id?: never
        }
        Update: {
          compared_pattern?: string
          difference_text?: string
          grammar_id?: number
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "grammar_differences_grammar_id_fkey"
            columns: ["grammar_id"]
            isOneToOne: false
            referencedRelation: "grammars"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_examples: {
        Row: {
          example_order: number | null
          grammar_id: number
          id: number
          japanese: string
          ruby: Json
          translation_vi: string | null
        }
        Insert: {
          example_order?: number | null
          grammar_id: number
          id?: never
          japanese: string
          ruby?: Json
          translation_vi?: string | null
        }
        Update: {
          example_order?: number | null
          grammar_id?: number
          id?: never
          japanese?: string
          ruby?: Json
          translation_vi?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grammar_examples_grammar_id_fkey"
            columns: ["grammar_id"]
            isOneToOne: false
            referencedRelation: "grammars"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_formations: {
        Row: {
          grammar_id: number
          group_index: number
          id: number
          left_text: string | null
          remove_text: string | null
          right_text: string | null
        }
        Insert: {
          grammar_id: number
          group_index?: number
          id?: never
          left_text?: string | null
          remove_text?: string | null
          right_text?: string | null
        }
        Update: {
          grammar_id?: number
          group_index?: number
          id?: never
          left_text?: string | null
          remove_text?: string | null
          right_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grammar_formations_grammar_id_fkey"
            columns: ["grammar_id"]
            isOneToOne: false
            referencedRelation: "grammars"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_notes: {
        Row: {
          grammar_id: number
          id: number
          note_text: string
          sort_order: number | null
        }
        Insert: {
          grammar_id: number
          id?: never
          note_text: string
          sort_order?: number | null
        }
        Update: {
          grammar_id?: number
          id?: never
          note_text?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grammar_notes_grammar_id_fkey"
            columns: ["grammar_id"]
            isOneToOne: false
            referencedRelation: "grammars"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_senses: {
        Row: {
          created_at: string
          explanation_vi: string | null
          grammar_id: number
          id: number
          meaning_vi: string
          nuance_vi: string | null
          sense_index: number
        }
        Insert: {
          created_at?: string
          explanation_vi?: string | null
          grammar_id: number
          id?: number
          meaning_vi: string
          nuance_vi?: string | null
          sense_index: number
        }
        Update: {
          created_at?: string
          explanation_vi?: string | null
          grammar_id?: number
          id?: number
          meaning_vi?: string
          nuance_vi?: string | null
          sense_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "grammar_senses_grammar_id_fkey"
            columns: ["grammar_id"]
            isOneToOne: false
            referencedRelation: "grammars"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_short_forms: {
        Row: {
          grammar_id: number
          id: number
          pattern: string
        }
        Insert: {
          grammar_id: number
          id?: never
          pattern: string
        }
        Update: {
          grammar_id?: number
          id?: never
          pattern?: string
        }
        Relationships: [
          {
            foreignKeyName: "grammar_short_forms_grammar_id_fkey"
            columns: ["grammar_id"]
            isOneToOne: false
            referencedRelation: "grammars"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_similar: {
        Row: {
          grammar_id: number
          similar_grammar_id: number
        }
        Insert: {
          grammar_id: number
          similar_grammar_id: number
        }
        Update: {
          grammar_id?: number
          similar_grammar_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "grammar_similar_grammar_id_fkey"
            columns: ["grammar_id"]
            isOneToOne: false
            referencedRelation: "grammars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grammar_similar_similar_grammar_id_fkey"
            columns: ["similar_grammar_id"]
            isOneToOne: false
            referencedRelation: "grammars"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_tags: {
        Row: {
          grammar_id: number
          id: number
          tag: string
        }
        Insert: {
          grammar_id: number
          id?: never
          tag: string
        }
        Update: {
          grammar_id?: number
          id?: never
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "grammar_tags_grammar_id_fkey"
            columns: ["grammar_id"]
            isOneToOne: false
            referencedRelation: "grammars"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_variants: {
        Row: {
          grammar_id: number
          id: number
          pattern: string
          variant_type: string | null
        }
        Insert: {
          grammar_id: number
          id?: never
          pattern: string
          variant_type?: string | null
        }
        Update: {
          grammar_id?: number
          id?: never
          pattern?: string
          variant_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grammar_variants_grammar_id_fkey"
            columns: ["grammar_id"]
            isOneToOne: false
            referencedRelation: "grammars"
            referencedColumns: ["id"]
          },
        ]
      }
      grammars: {
        Row: {
          ai_status: string | null
          common_pairs: Json | null
          created_at: string | null
          differences: Json | null
          display_pattern: string | null
          examples: Json | null
          explanation_en: string | null
          explanation_vi: string | null
          formation: Json | null
          frequency: string | null
          id: number
          is_common: boolean | null
          jlpt_level: string
          meaning_en: string | null
          meaning_vi: string
          notes: Json | null
          nuance_vi: string | null
          pattern: string
          reading: string | null
          reading_rules: Json | null
          register: string | null
          short_forms: Json | null
          short_meaning_vi: string | null
          similar_grammar: string[] | null
          slug: string
          sort_order: number | null
          source_id: string
          special_cases: Json
          tags: string[] | null
          updated_at: string | null
          variants: Json | null
        }
        Insert: {
          ai_status?: string | null
          common_pairs?: Json | null
          created_at?: string | null
          differences?: Json | null
          display_pattern?: string | null
          examples?: Json | null
          explanation_en?: string | null
          explanation_vi?: string | null
          formation?: Json | null
          frequency?: string | null
          id?: never
          is_common?: boolean | null
          jlpt_level: string
          meaning_en?: string | null
          meaning_vi: string
          notes?: Json | null
          nuance_vi?: string | null
          pattern: string
          reading?: string | null
          reading_rules?: Json | null
          register?: string | null
          short_forms?: Json | null
          short_meaning_vi?: string | null
          similar_grammar?: string[] | null
          slug: string
          sort_order?: number | null
          source_id: string
          special_cases?: Json
          tags?: string[] | null
          updated_at?: string | null
          variants?: Json | null
        }
        Update: {
          ai_status?: string | null
          common_pairs?: Json | null
          created_at?: string | null
          differences?: Json | null
          display_pattern?: string | null
          examples?: Json | null
          explanation_en?: string | null
          explanation_vi?: string | null
          formation?: Json | null
          frequency?: string | null
          id?: never
          is_common?: boolean | null
          jlpt_level?: string
          meaning_en?: string | null
          meaning_vi?: string
          notes?: Json | null
          nuance_vi?: string | null
          pattern?: string
          reading?: string | null
          reading_rules?: Json | null
          register?: string | null
          short_forms?: Json | null
          short_meaning_vi?: string | null
          similar_grammar?: string[] | null
          slug?: string
          sort_order?: number | null
          source_id?: string
          special_cases?: Json
          tags?: string[] | null
          updated_at?: string | null
          variants?: Json | null
        }
        Relationships: []
      }
      kanji_reading_examples: {
        Row: {
          id: number
          kanji: string
          priority: number
          reading: string
          reading_type: string
          vocabulary_id: number
        }
        Insert: {
          id?: number
          kanji: string
          priority?: number
          reading: string
          reading_type: string
          vocabulary_id: number
        }
        Update: {
          id?: number
          kanji?: string
          priority?: number
          reading?: string
          reading_type?: string
          vocabulary_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "kanji_reading_examples_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabularies"
            referencedColumns: ["id"]
          },
        ]
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
          han_viet: string | null
          id: number
          jlpt: number | null
          kanji: string
          kunyomi: string | null
          meaning_en: string | null
          meaning_vi: string | null
          onyomi: string | null
          radical: string | null
          radical_name_ja: string | null
          radical_name_vi: string | null
          radical_number: number | null
          stroke_count: number | null
          unicode: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          frequency?: number | null
          grade?: number | null
          han_viet?: string | null
          id?: never
          jlpt?: number | null
          kanji: string
          kunyomi?: string | null
          meaning_en?: string | null
          meaning_vi?: string | null
          onyomi?: string | null
          radical?: string | null
          radical_name_ja?: string | null
          radical_name_vi?: string | null
          radical_number?: number | null
          stroke_count?: number | null
          unicode?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          frequency?: number | null
          grade?: number | null
          han_viet?: string | null
          id?: never
          jlpt?: number | null
          kanji?: string
          kunyomi?: string | null
          meaning_en?: string | null
          meaning_vi?: string | null
          onyomi?: string | null
          radical?: string | null
          radical_name_ja?: string | null
          radical_name_vi?: string | null
          radical_number?: number | null
          stroke_count?: number | null
          unicode?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notebook_items: {
        Row: {
          added_at: string
          id: string
          item_id: string
          item_type: string
          notebook_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          item_id: string
          item_type: string
          notebook_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          item_id?: string
          item_type?: string
          notebook_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebook_items_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      notebooks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vocabularies: {
        Row: {
          created_at: string | null
          id: number
          is_common: boolean | null
          jlpt: string | null
          jmdict_id: string | null
          primary_kana: string | null
          primary_word: string
          romaji: string | null
          ruby: Json
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
          primary_kana?: string | null
          primary_word: string
          romaji?: string | null
          ruby?: Json
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
          primary_kana?: string | null
          primary_word?: string
          romaji?: string | null
          ruby?: Json
          source?: string | null
          updated_at?: string | null
          verb_group?: string | null
        }
        Relationships: []
      }
      vocabulary_collocations: {
        Row: {
          collocation_type: string | null
          confidence: number | null
          created_at: string | null
          expression_jp: string
          id: number
          meaning_en: string | null
          meaning_vi: string | null
          reading: string | null
          source: string | null
          vocabulary_id: number
        }
        Insert: {
          collocation_type?: string | null
          confidence?: number | null
          created_at?: string | null
          expression_jp: string
          id?: number
          meaning_en?: string | null
          meaning_vi?: string | null
          reading?: string | null
          source?: string | null
          vocabulary_id: number
        }
        Update: {
          collocation_type?: string | null
          confidence?: number | null
          created_at?: string | null
          expression_jp?: string
          id?: number
          meaning_en?: string | null
          meaning_vi?: string | null
          reading?: string | null
          source?: string | null
          vocabulary_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_collocations_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabularies"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_examples: {
        Row: {
          example_order: number
          id: number
          japanese: string
          ruby: Json
          sense_index: number | null
          translation_vi: string
          vocabulary_id: number
        }
        Insert: {
          example_order?: number
          id?: number
          japanese: string
          ruby?: Json
          sense_index?: number | null
          translation_vi: string
          vocabulary_id: number
        }
        Update: {
          example_order?: number
          id?: number
          japanese?: string
          ruby?: Json
          sense_index?: number | null
          translation_vi?: string
          vocabulary_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_examples_vocabulary_id_fkey"
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
          pitch: number | null
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
          pitch?: number | null
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
          pitch?: number | null
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
          confidence: number | null
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
          confidence?: number | null
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
          confidence?: number | null
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
          meaning_vi_confidence: string | null
          meaning_vi_glosses: Json | null
          meaning_vi_source: string | null
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
          meaning_vi_confidence?: string | null
          meaning_vi_glosses?: Json | null
          meaning_vi_source?: string | null
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
          meaning_vi_confidence?: string | null
          meaning_vi_glosses?: Json | null
          meaning_vi_source?: string | null
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
      user_profiles: {
        Row: {
          id: string
          display_name: string
          jlpt_level: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          jlpt_level?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          jlpt_level?: string | null
          created_at?: string
        }
        Relationships: []
      }
      word_comments: {
        Row: {
          id: string
          user_id: string
          entry_type: string
          entry_id: number
          content: string
          likes_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_type: string
          entry_id: number
          content: string
          likes_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_type?: string
          entry_id?: number
          content?: string
          likes_count?: number
          created_at?: string
        }
        Relationships: []
      }
      word_comment_likes: {
        Row: {
          user_id: string
          comment_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          comment_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          comment_id?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_kanji_reading_examples_rpc: {
        Args: {
          search_kanji: string
          search_reading: string
          search_reading_type: string
        }
        Returns: {
          id: number
          kana: string
          meaning_en: string
          meaning_vi: string
          priority: number
          word: string
        }[]
      }
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
      normalize_japanese_reading: { Args: { input: string }; Returns: string }
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
      update_vocabulary_ruby_bulk:
        | { Args: { payload: Json }; Returns: number }
        | { Args: { force_update?: boolean; payload: Json }; Returns: number }
      update_vocabulary_ruby_missing: {
        Args: { payload: Json }
        Returns: number
      }
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
