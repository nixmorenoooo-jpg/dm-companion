import { useState } from 'react'
import Bestiary from './components/Bestiary'
import Loot from './components/Loot'
import Dice from './components/Dice'

const TABS = [
  { id: 'bestiary', label: 'Bestiario', View: Bestiary },
  { id: 'loot', label: 'Botín', View: Loot },
  { id: 'dice', label: 'Dados', View: Dice },
]

export default function App() {
  const [tab, setTab] = useState('bestiary')
  const { View } = TABS.find((t) => t.id === tab)

  return (
    <div className="app">
      <header className="top">
        <h1>DM Companion</h1>
        <p>Herramientas para tu mesa de D&D 5e</p>
      </header>
      <main>
        <View />
      </main>
      <nav className="tabs" aria-label="Secciones">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
