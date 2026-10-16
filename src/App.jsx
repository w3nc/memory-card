import { useEffect } from 'react'
import './styles/base.css'
import Editor from './components/Editor'
import Resume from './components/Resume'
import useHistory from './useHistory'
import { example, migrate } from './data'

const KEY = 'cv-builder-v2'

const load = () => {
  try { return migrate(JSON.parse(localStorage.getItem(KEY))) } catch { return null }
}

export default function App() {
  const { cv, set, undo, redo, canUndo, canRedo } = useHistory(() => load() ?? example())

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(cv)) } catch {}
  }, [cv])

  // Ctrl/Cmd+Z = undo, Ctrl/Cmd+Shift+Z or Ctrl+Y = redo
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const k = e.key.toLowerCase()
      if (k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo() }
      else if (k === 'y') { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  return (
    <div className="app">
      <Editor cv={cv} setCv={set} undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} />
      <main className="stage"><Resume cv={cv} /></main>
    </div>
  )
}
