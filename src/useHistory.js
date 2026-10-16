import { useCallback, useRef, useState } from 'react'

const LIMIT = 100
const WINDOW = 800 // ms: edits to the same field inside this window become one undo step

export default function useHistory(init) {
  const [h, setH] = useState(() => ({ past: [], present: typeof init === 'function' ? init() : init, future: [] }))
  const last = useRef({ key: null, t: 0 })

  const set = useCallback((next, key = null) => {
    const now = Date.now()
    const merge = key !== null && key === last.current.key && now - last.current.t < WINDOW
    last.current = { key, t: now }
    setH((s) => {
      const value = typeof next === 'function' ? next(s.present) : next
      if (value === s.present) return s
      return { past: merge ? s.past : [...s.past, s.present].slice(-LIMIT), present: value, future: [] }
    })
  }, [])

  const undo = useCallback(() => {
    last.current = { key: null, t: 0 }
    setH((s) => (s.past.length ? { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future] } : s))
  }, [])
  const redo = useCallback(() => {
    last.current = { key: null, t: 0 }
    setH((s) => (s.future.length ? { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) } : s))
  }, [])

  return { cv: h.present, set, undo, redo, canUndo: h.past.length > 0, canRedo: h.future.length > 0 }
}
