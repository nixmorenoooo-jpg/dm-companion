import { useState } from 'react'

const DICE = [4, 6, 8, 10, 12, 20, 100]
const roll = (sides) => Math.floor(Math.random() * sides) + 1

export default function Dice() {
  const [sides, setSides] = useState(20)
  const [result, setResult] = useState(null)
  const [rolling, setRolling] = useState(false)
  const [history, setHistory] = useState([])

  function throwDie() {
    setRolling(true)
    setTimeout(() => {
      const value = roll(sides)
      setResult({ sides, value })
      setHistory((h) => [{ sides, value }, ...h].slice(0, 8))
      setRolling(false)
    }, 450)
  }

  const crit = result && result.sides === 20 && (result.value === 20 || result.value === 1)

  return (
    <section>
      <h2>Bandeja de dados</h2>
      <div className="dice-row" role="radiogroup" aria-label="Tipo de dado">
        {DICE.map((d) => (
          <button
            key={d}
            role="radio"
            aria-checked={sides === d}
            className={`die ${sides === d ? 'die--on' : ''}`}
            onClick={() => setSides(d)}
          >
            d{d}
          </button>
        ))}
      </div>
      <button className="btn" onClick={throwDie} disabled={rolling}>
        Lanzar d{sides}
      </button>

      <div className={`result ${rolling ? 'result--rolling' : ''} ${crit ? (result.value === 20 ? 'result--crit' : 'result--fumble') : ''}`} aria-live="polite">
        {result ? (
          <>
            <span className="result__value">{result.value}</span>
            <span className="result__label">
              d{result.sides}
              {crit && (result.value === 20 ? ' · ¡Crítico!' : ' · ¡Pifia!')}
            </span>
          </>
        ) : (
          <span className="result__label">Elige un dado y lánzalo</span>
        )}
      </div>

      {history.length > 0 && (
        <p className="history">
          Últimos: {history.map((h, i) => <span key={i}>d{h.sides}: <b>{h.value}</b></span>)}
        </p>
      )}
    </section>
  )
}
