import { useRef, useState } from 'react'
import { migrate, uid, VERSION, blank, example } from '../data'
import Icon from './Icon'
import Dialog from './Dialog'
import { validEmail, validPhone, dateHint } from '../validate'
import { resizePhoto } from '../photo'
import '../styles/editor.css'

const SWATCHES = ['#0f364d', '#1d4ed8', '#0f766e', '#7c2d12', '#6d28d9', '#be123c', '#27272a']
const PRESETS = ['Projects', 'Certifications', 'Languages', 'Volunteering']
const DATES = [{ k: 'start', label: 'Start', ph: 'MM/YYYY' }, { k: 'end', label: 'End', ph: 'Blank = present' }]
const EDU = [{ k: 'school', label: 'School' }, { k: 'degree', label: 'Degree' }, DATES, { k: 'location', label: 'Location' }]
const EXP = [
  { k: 'company', label: 'Company' }, { k: 'title', label: 'Job title' }, DATES, { k: 'location', label: 'Location' },
  { k: 'desc', label: 'Description', area: true, rows: 5, hint: 'Start a line with "- " to make a bullet point.' },
]
const ITEM = [
  { k: 'title', label: 'Title' }, { k: 'subtitle', label: 'Subtitle', ph: 'Optional' }, DATES, { k: 'location', label: 'Location' },
  { k: 'desc', label: 'Description', area: true, rows: 4, hint: 'Start a line with "- " to make a bullet point.' },
]
const blankItem = (id) => ({ id, title: '', subtitle: '', start: '', end: '', location: '', desc: '' })
const blankFor = (ref, id) => (ref === 'education' ? { id, school: '', degree: '', start: '', end: '', location: '' }
  : ref === 'experience' ? { id, company: '', title: '', start: '', end: '', location: '', desc: '' } : blankItem(id))

// A list is addressed by a ref: 'education', 'experience' or 'sec:<sectionId>'
const getList = (n, ref) => (ref.startsWith('sec:') ? n.sections.find((x) => x.id === ref.slice(4)).items : n[ref])
const swap = (a, i, j) => { if (j >= 0 && j < a.length) [a[i], a[j]] = [a[j], a[i]] }

function Field({ label, hint, area, rows = 3, ph, value, onChange, error }) {
  const props = { value, placeholder: ph, onChange: (e) => onChange(e.target.value), 'aria-invalid': !!error }
  return (
    <>
      <label>{label}{hint && !area && <small>{hint}</small>}</label>
      {area ? <textarea rows={rows} {...props} /> : <input type="text" {...props} />}
      {area && hint && <p className="hint">{hint}</p>}
      {error && <p className="err" role="alert">{error}</p>}
    </>
  )
}

export default function Editor({ cv, setCv, undo, redo, canUndo, canRedo }) {
  const [tab, setTab] = useState('content')
  const [open, setOpen] = useState(() => new Set())
  const [dialog, setDialog] = useState(null)
  const [toast, setToast] = useState(null)
  const fileRef = useRef(null)
  const photoRef = useRef(null)
  const timer = useRef(null)
  const s = cv.settings

  const toggle = (id, isOpen) => setOpen((p) => (p.has(id) === isOpen ? p : new Set(isOpen ? [...p, id] : [...p].filter((x) => x !== id))))
  const det = (id) => ({ open: open.has(id), onToggle: (e) => toggle(id, e.currentTarget.open) })

  const notify = (msg, onUndo) => {
    clearTimeout(timer.current)
    setToast({ msg, onUndo })
    timer.current = setTimeout(() => setToast(null), 5000)
  }
  const toastUndo = () => { undo(); setToast(null) }
  // run a change and offer a one-click undo
  const withUndo = (msg, fn) => { fn(); notify(msg, toastUndo) }

  const update = (fn, key) => setCv((c) => { const n = structuredClone(c); fn(n); return n }, key)
  const setP = (k, v) => update((n) => { n.personal[k] = v }, `p.${k}`)
  const setS = (k, v) => update((n) => { n.settings[k] = v }, `s.${k}`)
  const setE = (ref, id, k, v) => update((n) => { getList(n, ref).find((e) => e.id === id)[k] = v }, `${ref}.${id}.${k}`)
  const move = (ref, id, d) => update((n) => { const a = getList(n, ref); swap(a, a.findIndex((e) => e.id === id), a.findIndex((e) => e.id === id) + d) })
  const del = (ref, id) => withUndo('Entry deleted', () => update((n) => { const a = getList(n, ref); a.splice(a.findIndex((e) => e.id === id), 1) }))
  const add = (ref) => { const id = uid(); update((n) => { getList(n, ref).push(blankFor(ref, id)) }); toggle(id, true) }

  const addSec = (title) => {
    const id = uid(), item = uid()
    update((n) => { n.sections.push({ id, title, items: [blankItem(item)] }) })
    toggle(`sec-${id}`, true); toggle(item, true)
  }
  const setSecTitle = (id, v) => update((n) => { n.sections.find((x) => x.id === id).title = v }, `st.${id}`)
  const moveSec = (id, d) => update((n) => { const i = n.sections.findIndex((x) => x.id === id); swap(n.sections, i, i + d) })
  const delSec = (id) => withUndo('Section deleted', () => update((n) => { n.sections = n.sections.filter((x) => x.id !== id) }))

  const pickPhoto = async (e) => {
    const f = e.target.files[0]
    e.target.value = ''
    if (!f) return
    try { setP('photo', await resizePhoto(f)) }
    catch { setDialog({ title: "Can't use that image", body: 'Choose a JPG, PNG or WebP picture.' }) }
  }
  const emailErr = validEmail(cv.personal.email) ? '' : 'Check the email address. It should look like name@example.com.'
  const phoneErr = validPhone(cv.personal.phone) ? '' : 'Phone numbers can only contain digits, spaces and + ( ) - .'

  const loadExample = () => withUndo('Example loaded', () => setCv({ ...example(), settings: s }))
  const askClear = () => setDialog({
    title: 'Clear this resume?',
    body: 'All your details will be removed. You can undo it right afterwards.',
    confirmLabel: 'Clear resume',
    danger: true,
    onConfirm: () => withUndo('Resume cleared', () => setCv({ ...blank(), settings: s })),
  })
  const exportFile = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ ...cv, version: VERSION }, null, 2)], { type: 'application/json' }))
    a.download = 'resume.json'
    a.click()
    notify('Saved resume.json')
  }
  const importFile = (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    const r = new FileReader()
    r.onload = () => {
      let d = null
      try { d = migrate(JSON.parse(r.result)) } catch {}
      if (!d) return setDialog({ title: "Can't open that file", body: "It doesn't look like a resume saved from this app. Try a file made with Save file." })
      withUndo('Resume opened', () => setCv(d))
    }
    r.readAsText(file)
  }

  const renderEntries = (ref, fields, titleKey) => (
    <>
      {getList(cv, ref).map((e) => (
        <details className="entry" key={e.id} {...det(e.id)}>
          <summary>{e[titleKey] || '(Untitled)'}</summary>
          <div className="body">
            {fields.map((f, i) => Array.isArray(f)
              ? <div key={i}><div className="row">{f.map((g) => <div key={g.k}><Field {...g} value={e[g.k]} onChange={(v) => setE(ref, e.id, g.k, v)} /></div>)}</div>{dateHint(e.start, e.end) && <p className="err" role="alert">{dateHint(e.start, e.end)}</p>}</div>
              : <Field key={f.k} {...f} value={e[f.k]} onChange={(v) => setE(ref, e.id, f.k, v)} />)}
            <div className="acts">
              <button onClick={() => move(ref, e.id, -1)}>↑ Up</button>
              <button onClick={() => move(ref, e.id, 1)}>↓ Down</button>
              <button className="del" onClick={() => del(ref, e.id)}>Delete</button>
            </div>
          </div>
        </details>
      ))}
      <button className="add" onClick={() => add(ref)}>+ Add {ref.startsWith('sec:') ? 'item' : ref}</button>
    </>
  )

  return (
    <>
      <nav className="rail" aria-label="Resume tools">
        <div className="grp" role="tablist" aria-label="Editor">
          {[['content', 'Content', 'file'], ['custom', 'Customize', 'brush']].map(([k, n, ic]) => (
            <button key={k} className="tab" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}><Icon name={ic} />{n}</button>
          ))}
        </div>
        <hr />
        <div className="grp">
          <button className="tab" onClick={loadExample}><Icon name="wand" />Load example</button>
          <button className="tab" onClick={exportFile}><Icon name="save" />Save file</button>
          <button className="tab" onClick={() => fileRef.current.click()}><Icon name="open" />Open file</button>
          <button className="tab danger" onClick={askClear}><Icon name="trash" />Clear resume</button>
          <button className="tab" onClick={() => window.print()}><Icon name="pdf" />Download PDF</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importFile} />
        </div>
        <hr />
        <div className="grp pair">
          <button className="tab" onClick={undo} disabled={!canUndo} aria-label="Undo" title="Undo (Ctrl+Z)"><Icon name="undo" /></button>
          <button className="tab" onClick={redo} disabled={!canRedo} aria-label="Redo" title="Redo (Ctrl+Shift+Z)"><Icon name="redo" /></button>
        </div>
      </nav>

      <div className="panel" key={tab}>
        {tab === 'custom' ? (
          <>
            <div className="sec"><h2>Template</h2><div className="opts">
              {[['classic', 'Classic'], ['minimal', 'Minimal'], ['compact', 'Compact'], ['bold', 'Bold']].map(([k, n]) => (
                <button key={k} className="opt" aria-pressed={(s.template || 'classic') === k} onClick={() => setS('template', k)}>{n}</button>
              ))}
            </div></div>
            <div className="sec"><h2>Layout</h2><div className="opts">
              {[['t', 'Top'], ['l', 'Left'], ['r', 'Right']].map(([k, n]) => (
                <button key={k} className={`opt lay ${k}`} aria-pressed={s.layout === k} onClick={() => setS('layout', k)}><i /><span>{n}</span></button>
              ))}
            </div></div>
            <div className="sec"><h2>Color</h2><div className="swatches">
              {SWATCHES.map((c) => <button key={c} className="sw" style={{ background: c }} aria-label={`Accent ${c}`} aria-pressed={s.color === c} onClick={() => setS('color', c)} />)}
              <input type="color" value={s.color} aria-label="Custom accent color" onChange={(e) => setS('color', e.target.value)} />
            </div></div>
            <div className="sec"><h2>Fonts</h2><div className="opts">
              {[['serif', 'Serif'], ['sans', 'Sans'], ['mono', 'Mono']].map(([k, n]) => <button key={k} className="opt" aria-pressed={s.font === k} onClick={() => setS('font', k)}>{n}</button>)}
            </div></div>
            <div className="sec"><h2>Text size</h2>
              <input type="range" min="0.8" max="1.2" step="0.05" value={s.size} aria-label="Text size" onChange={(e) => setS('size', +e.target.value)} />
            </div>
          </>
        ) : (
          <>
            <div className="sec">
              <h2>Personal details</h2>
              <div className="photo">
                {cv.personal.photo ? <img src={cv.personal.photo} alt="Profile preview" /> : <span className="ph-empty"><Icon name="user" /></span>}
                <div>
                  <button className="opt" onClick={() => photoRef.current.click()}>{cv.personal.photo ? 'Change photo' : 'Add photo'}</button>
                  {cv.personal.photo && <button className="opt" onClick={() => setP('photo', '')}>Remove</button>}
                </div>
                <input ref={photoRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
              </div>
              <Field label="Full name" value={cv.personal.name} onChange={(v) => setP('name', v)} />
              <Field label="Email" hint="recommended" error={emailErr} value={cv.personal.email} onChange={(v) => setP('email', v)} />
              <Field label="Phone number" hint="recommended" error={phoneErr} value={cv.personal.phone} onChange={(v) => setP('phone', v)} />
              <Field label="Address" hint="recommended" value={cv.personal.address} onChange={(v) => setP('address', v)} />
              <Field label="Summary" area ph="Two or three lines about you" value={cv.personal.summary} onChange={(v) => setP('summary', v)} />
            </div>
            <details className="sec" {...det('sec-education')}><summary><span className="st"><Icon name="cap" />Education</span></summary><div className="body">{renderEntries('education', EDU, 'school')}</div></details>
            <details className="sec" {...det('sec-experience')}><summary><span className="st"><Icon name="case" />Experience</span></summary><div className="body">{renderEntries('experience', EXP, 'company')}</div></details>

            {cv.sections.map((x) => (
              <details className="sec" key={x.id} {...det(`sec-${x.id}`)}>
                <summary><span className="st"><Icon name="list" />{x.title || 'Untitled section'}</span></summary>
                <div className="body">
                  <Field label="Section title" value={x.title} onChange={(v) => setSecTitle(x.id, v)} />
                  <div style={{ height: 14 }} />
                  {renderEntries(`sec:${x.id}`, ITEM, 'title')}
                  <div className="acts">
                    <button onClick={() => moveSec(x.id, -1)}>↑ Move section</button>
                    <button onClick={() => moveSec(x.id, 1)}>↓ Move section</button>
                    <button className="del" onClick={() => delSec(x.id)}>Delete section</button>
                  </div>
                </div>
              </details>
            ))}

            <details className="sec" {...det('sec-skills')}><summary><span className="st"><Icon name="star" />Skills</span></summary><div className="body">
              <Field label="Skills" area ph="Separate with commas" value={cv.skills} onChange={(v) => setCv((c) => ({ ...c, skills: v }), 'skills')} />
            </div></details>

            <div className="sec">
              <h2>Add a section</h2>
              <div className="presets">
                {PRESETS.map((t) => <button key={t} className="opt" onClick={() => addSec(t)}>+ {t}</button>)}
                <button className="opt" onClick={() => addSec('New section')}>+ Custom</button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog dialog={dialog} onClose={() => setDialog(null)} />
      {toast && (
        <div className="toast" role="status" key={toast.msg}>
          <span>{toast.msg}</span>
          {toast.onUndo && <button onClick={toast.onUndo}>Undo</button>}
        </div>
      )}
    </>
  )
}
