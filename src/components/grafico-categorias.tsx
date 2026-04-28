'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type Props = {
  dados: {
    nome: string
    valor: number
  }[]
}

const CORES = [
  '#DC2626', // vermelho
  '#D97706', // âmbar
  '#7C3AED', // roxo
  '#DB2777', // rosa
  '#0891B2', // ciano
  '#65A30D', // lima
  '#EA580C', // laranja
  '#0D9488', // verde-azulado
  '#9333EA', // violeta
  '#E11D48', // rosa-avermelhado
  '#B45309', // marrom-dourado
  '#0369A1', // azul-petróleo
  '#15803D', // verde-escuro
  '#C2410C', // terracota
  '#7E22CE', // púrpura
  '#0F766E', // esmeralda-escuro
  '#A21CAF', // fúcsia-escuro
  '#92400E', // marrom
  '#1D4ED8', // índigo
  '#BE123C', // carmesim
]

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function GraficoCategorias({ dados }: Props) {
  if (dados.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[#6B7280] text-sm">
        Nenhum gasto registrado neste mês.
      </div>
    )
  }

  const total = dados.reduce((acc, d) => acc + d.valor, 0)

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={dados}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            dataKey="valor"
          >
            {dados.map((_, index) => (
              <Cell key={index} fill={CORES[index % CORES.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(valor) => formatarMoeda(Number(valor))}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-2 mt-2">
        {dados.map((d, index) => (
          <div key={d.nome} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: CORES[index % CORES.length] }}
              />
              <span className="text-[#6B7280]">{d.nome}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#111827] font-medium">{formatarMoeda(d.valor)}</span>
              <span className="text-[#6B7280] text-xs w-8 text-right">
                {Math.round((d.valor / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}