import { useState } from 'react'
import { api, formatCR } from '../api'
import StatCard from './StatCard'

const CRS = [0, 0.125, 0.25, 0.5, ...Array.from({ length: 30 }, (_, i) => i + 1)]
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n)

// Monedas: la cantidad crece con el CR
function rollCoins(cr) {
  const t = Math.max(cr, 0.5)
  const coins = { cp: 0, sp: 0, gp: 0, pp: 0 }
  if (cr < 5) {
    coins.cp = rnd(5, 20) * Math.ceil(t * 2)
    coins.sp = rnd(2, 10) * Math.ceil(t * 2)
    coins.gp = rnd(0, 6) * Math.ceil(t)
  } else if (cr < 11) {
    coins.sp = rnd(10, 40) * Math.ceil(t / 2)
    coins.gp = rnd(5, 30) * Math.ceil(t)
    coins.pp = rnd(0, 5) * Math.ceil(t / 3)
  } else if (cr < 17) {
    coins.gp = rnd(50, 200) * Math.ceil(t / 2)
    coins.pp = rnd(5, 40) * Math.ceil(t / 3)
  } else {
    coins.gp = rnd(300, 1000) * Math.ceil(t / 2)
    coins.pp = rnd(50, 200) * Math.ceil(t / 3)
  }
  return coins
}

// Cantidad y calidad de objetos según el CR
function itemPlan(cr) {
  if (cr < 5) return { mundane: rnd(1, 2), magic: 0 }
  if (cr < 11) return { mundane: rnd(1, 2), magic: rnd(0, 1) }
  if (cr < 17) return { mundane: rnd(1, 2), magic: rnd(1, 2) }
  return { mundane: rnd(1, 2), magic: rnd(2, 3) }
}

export default function Loot() {
  const [cr, setCr] = useState(1)
  const [loot, setLoot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true); setError('')
    try {
      const plan = itemPlan(cr)
      const [eq, mg] = await Promise.all([
        api('/api/equipment'),
        plan.magic ? api('/api/magic-items') : Promise.resolve({ results: [] }),
      ])
      const chosen = [
        ...pick(eq.results, plan.mundane).map((i) => ({ ...i, magic: false })),
        ...pick(mg.results, plan.magic).map((i) => ({ ...i, magic: true })),
      ]
      const items = await Promise.all(
        chosen.map(async (i) => {
          const d = await api(i.url)
          return {
            name: d.name,
            magic: i.magic,
            kind: d.equipment_category?.name,
            rarity: d.rarity?.name,
            cost: d.cost ? `${d.cost.quantity} ${d.cost.unit}` : null,
          }
        })
      )
      setLoot({ cr, coins: rollCoins(cr), items })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const coinNames = { cp: 'Cobre', sp: 'Plata', gp: 'Oro', pp: 'Platino' }

  return (
    <section>
      <h2>Generador de botín</h2>
      <label className="field">
        Nivel de desafío del monstruo derrotado
        <select className="input" value={cr} onChange={(e) => setCr(Number(e.target.value))}>
          {CRS.map((c) => <option key={c} value={c}>CR {formatCR(c)}</option>)}
        </select>
      </label>
      <button className="btn" onClick={generate} disabled={loading}>
        {loading ? 'Buscando en el tesoro…' : 'Generar botín'}
      </button>
      {error && <p className="note note--err">{error}. Intenta de nuevo.</p>}

      {loot && (
        <div className="loot">
          <div className="coins">
            {Object.entries(loot.coins).filter(([, v]) => v > 0).map(([k, v]) => (
              <div key={k} className={`coin coin--${k}`}>
                <strong>{v}</strong>
                <span>{coinNames[k]} ({k})</span>
              </div>
            ))}
          </div>
          <div className="grid">
            {loot.items.map((it, i) => (
              <StatCard
                key={i}
                title={it.name}
                subtitle={it.magic ? 'Objeto mágico' : 'Equipo'}
                accent={it.magic ? 'magic' : undefined}
                stats={[
                  { label: 'Categoría', value: it.kind },
                  { label: it.magic ? 'Rareza' : 'Valor', value: it.magic ? it.rarity : it.cost },
                ]}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
