import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fvjvxqojsditudefuiee.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2anZ4cW9qc2RpdHVkZWZ1aWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjMyNTQsImV4cCI6MjA2OTczOTI1NH0.iMEZeFVt0Sooj5wzH-AKFUXAdHShva5bSFJUSrSphpk'

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { nome, telefone, data, hora, servicos } = req.body

    if (!nome || !telefone || !data || !hora || !servicos) {
      return res.status(400).json({ error: 'Faltam dados' })
    }

    const { data: agendamentosExistentes, error: erroBusca } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('data', data)
      .eq('hora', hora)

    if (erroBusca) {
      return res.status(500).json({ error: 'Erro ao verificar agendamentos' })
    }

    if (agendamentosExistentes.length > 0) {
      return res.status(409).json({ error: 'Horário já ocupado' })
    }

    const { data: novoAgendamento, error } = await supabase
      .from('agendamentos')
      .insert([{ nome, telefone, data, hora, servicos }])

    if (error) {
      return res.status(500).json({ error: 'Erro ao salvar agendamento' })
    }

    return res.status(200).json({ mensagem: 'Agendamento salvo com sucesso!' })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
