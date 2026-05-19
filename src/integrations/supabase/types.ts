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
      events: {
        Row: {
          apuracao_finalizada: boolean | null
          arquivos: Json | null
          beneficios: string | null
          brindes_alocados: Json | null
          cidade: string | null
          clientes: Json | null
          comentarios: Json | null
          conteudo: string | null
          cota: string | null
          created_at: string
          created_by: string | null
          custo_brindes: number | null
          custo_hospedagem: number | null
          custo_ingressos: number | null
          custo_outros: number | null
          custo_passagens: number | null
          custo_real: number | null
          custo_uniformes: number | null
          data_fim: string | null
          data_ini: string
          descricao: string | null
          equipe: Json | null
          estoque_baixa_processada: boolean | null
          evento: string
          formato: string | null
          historico: Json | null
          hora_fim: string | null
          hora_ini: string | null
          id: string
          links: string | null
          localidade: string | null
          materiais: string | null
          obs: string | null
          orcamento_total: number | null
          organizadores: Json | null
          outros_custos_lista: Json | null
          participantes: string | null
          previsao_fechamento: number | null
          previsao_pipe: number | null
          publico: string | null
          receita_estimada: number | null
          responsavel: string | null
          status: string
          tipo: string
          tipo_financeiro: string | null
          uf: string | null
          updated_at: string
          vagas_cliente: number | null
          vagas_staff: number | null
          vagas_vip: number | null
          vips: Json | null
        }
        Insert: {
          apuracao_finalizada?: boolean | null
          arquivos?: Json | null
          beneficios?: string | null
          brindes_alocados?: Json | null
          cidade?: string | null
          clientes?: Json | null
          comentarios?: Json | null
          conteudo?: string | null
          cota?: string | null
          created_at?: string
          created_by?: string | null
          custo_brindes?: number | null
          custo_hospedagem?: number | null
          custo_ingressos?: number | null
          custo_outros?: number | null
          custo_passagens?: number | null
          custo_real?: number | null
          custo_uniformes?: number | null
          data_fim?: string | null
          data_ini: string
          descricao?: string | null
          equipe?: Json | null
          estoque_baixa_processada?: boolean | null
          evento: string
          formato?: string | null
          historico?: Json | null
          hora_fim?: string | null
          hora_ini?: string | null
          id?: string
          links?: string | null
          localidade?: string | null
          materiais?: string | null
          obs?: string | null
          orcamento_total?: number | null
          organizadores?: Json | null
          outros_custos_lista?: Json | null
          participantes?: string | null
          previsao_fechamento?: number | null
          previsao_pipe?: number | null
          publico?: string | null
          receita_estimada?: number | null
          responsavel?: string | null
          status?: string
          tipo?: string
          tipo_financeiro?: string | null
          uf?: string | null
          updated_at?: string
          vagas_cliente?: number | null
          vagas_staff?: number | null
          vagas_vip?: number | null
          vips?: Json | null
        }
        Update: {
          apuracao_finalizada?: boolean | null
          arquivos?: Json | null
          beneficios?: string | null
          brindes_alocados?: Json | null
          cidade?: string | null
          clientes?: Json | null
          comentarios?: Json | null
          conteudo?: string | null
          cota?: string | null
          created_at?: string
          created_by?: string | null
          custo_brindes?: number | null
          custo_hospedagem?: number | null
          custo_ingressos?: number | null
          custo_outros?: number | null
          custo_passagens?: number | null
          custo_real?: number | null
          custo_uniformes?: number | null
          data_fim?: string | null
          data_ini?: string
          descricao?: string | null
          equipe?: Json | null
          estoque_baixa_processada?: boolean | null
          evento?: string
          formato?: string | null
          historico?: Json | null
          hora_fim?: string | null
          hora_ini?: string | null
          id?: string
          links?: string | null
          localidade?: string | null
          materiais?: string | null
          obs?: string | null
          orcamento_total?: number | null
          organizadores?: Json | null
          outros_custos_lista?: Json | null
          participantes?: string | null
          previsao_fechamento?: number | null
          previsao_pipe?: number | null
          publico?: string | null
          receita_estimada?: number | null
          responsavel?: string | null
          status?: string
          tipo?: string
          tipo_financeiro?: string | null
          uf?: string | null
          updated_at?: string
          vagas_cliente?: number | null
          vagas_staff?: number | null
          vagas_vip?: number | null
          vips?: Json | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string
          created_by: string | null
          custo_unitario: number | null
          fornecedor: string | null
          foto_url: string | null
          id: string
          localizacao: string | null
          nome: string
          obs: string | null
          qtd_reservada: number
          qtd_total: number
          unidade: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          created_by?: string | null
          custo_unitario?: number | null
          fornecedor?: string | null
          foto_url?: string | null
          id?: string
          localizacao?: string | null
          nome: string
          obs?: string | null
          qtd_reservada?: number
          qtd_total?: number
          unidade?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          created_by?: string | null
          custo_unitario?: number | null
          fornecedor?: string | null
          foto_url?: string | null
          id?: string
          localizacao?: string | null
          nome?: string
          obs?: string | null
          qtd_reservada?: number
          qtd_total?: number
          unidade?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
