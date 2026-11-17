import { useEffect, useState } from 'react'
import { api, getAC, formatCR } from '../api'
import StatCard from './StatCard'

const PAGE = 12

export default function Bestiary() {
  const [all, setAll] = useState([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [details, setDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/monsters')
      .then((d) => setAll(d.results))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = all.filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase()))
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const visible = filtered.slice(page * PAGE, page * PAGE + PAGE)

  // Carga los datos completos solo de los monstruos visibles
  useEffect(() => {
    visible.forEach((m) => {
      if (details[m.index]) return
      api(m.url)
        .then((d) => setDetails((prev) => ({ ...prev, [m.index]: d })))
        .catch(() => setDetails((prev) => ({ ...prev, [m.index]: { failed: true } })))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, query, page])

  return (
    <section>
      <h2>Bestiario</h2>
      <input
        className="input"
        type="search"
        placeholder="Buscar monstruo (ej. dragon, goblin)"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setPage(0) }}
      />
      {loading && <p className="note">Cargando monstruos…</p>}
      {error && <p className="note note--err">{error}. Revisa tu conexión e intenta de nuevo.</p>}
      {!loading && !error && filtered.length === 0 && <p className="note">Ningún monstruo coincide con “{query}”.</p>}

      <div className="grid">
        {visible.map((m) => {
          const d = details[m.index]
          if (!d) return <StatCard key={m.index} title={m.name} subtitle="Cargando…" />
          if (d.failed) return <StatCard key={m.index} title={m.name} subtitle="No se pudo cargar" />
          return (
            <StatCard
              key={m.index}
              title={d.name}
              subtitle={`${d.size} ${d.type}`}
              accent="monster"
              stats={[
                { label: 'Armadura (AC)', value: getAC(d) },
                { label: 'Puntos de golpe', value: d.hit_points },
                { label: 'Desafío (CR)', value: formatCR(d.challenge_rating) },
              ]}
            />
          )
        })}
      </div>

      {filtered.length > PAGE && (
        <div className="pager">
          <button className="btn btn--ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button>
          <span>{page + 1} / {pages}</span>
          <button className="btn btn--ghost" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Siguiente</button>
        </div>
      )}
    </section>
  )
}
