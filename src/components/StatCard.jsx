// Tarjeta genérica y reutilizable: título, subtítulo opcional, lista de estadísticas y contenido extra
export default function StatCard({ title, subtitle, stats = [], accent, children }) {
  return (
    <article className={`card ${accent ? 'card--' + accent : ''}`}>
      <h3 className="card__title">{title}</h3>
      {subtitle && <p className="card__sub">{subtitle}</p>}
      {stats.length > 0 && (
        <dl className="card__stats">
          {stats.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value ?? '—'}</dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </article>
  )
}
