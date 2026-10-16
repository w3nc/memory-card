import { useEffect, useRef } from 'react'
import '../styles/dialog.css'

// Styled replacement for alert()/confirm(), built on the native <dialog>
// (focus trap, Esc to close and backdrop come for free).
export default function Dialog({ dialog, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    if (dialog && !d.open) d.showModal()
    if (!dialog && d.open) d.close()
  }, [dialog])

  return (
    <dialog ref={ref} className="dlg" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      {dialog && (
        <div className="dlg-in">
          <h2>{dialog.title}</h2>
          <p>{dialog.body}</p>
          <div className="dlg-act">
            {dialog.onConfirm && <button className="btn" onClick={onClose}>Cancel</button>}
            <button
              className={`btn ${dialog.danger ? 'btn-danger' : 'btn-primary'}`}
              autoFocus
              onClick={() => { dialog.onConfirm?.(); onClose() }}
            >
              {dialog.confirmLabel || 'OK'}
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
