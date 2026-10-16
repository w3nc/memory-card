import { lum } from '../data'
import Icon from './Icon'
import '../styles/resume.css'

const FONTS = {
  serif: '"Noto Serif",Georgia,serif',
  sans: '"Noto Sans",system-ui,sans-serif',
  mono: '"JetBrains Mono",ui-monospace,monospace',
}
const BULLET = /^\s*[-•]\s/

function Body({ text }) {
  const lines = text.split('\n').filter((x) => x.trim())
  const plain = lines.filter((x) => !BULLET.test(x))
  const bullets = lines.filter((x) => BULLET.test(x))
  return (
    <>
      {plain.length > 0 && <p>{plain.join(' ')}</p>}
      {bullets.length > 0 && <ul>{bullets.map((x, i) => <li key={i}>{x.replace(BULLET, '')}</li>)}</ul>}
    </>
  )
}

function Item({ e, head, sub }) {
  const when = e.start || e.end ? `${e.start} – ${e.end || 'present'}` : ''
  const left = [when, e.location].filter(Boolean).join('\n')
  return (
    <div className={`it${left ? '' : ' nl'}`}>
      {left && <div className="d">{left}</div>}
      <div>
        <b>{head}</b>
        {sub && <div>{sub}</div>}
        {e.desc && <Body text={e.desc} />}
      </div>
    </div>
  )
}

const Section = ({ title, children }) => <section><h3>{title}</h3>{children}</section>

export default function Resume({ cv }) {
  const { personal: p, education, experience, settings: s } = cv
  const skills = cv.skills.split(/[,•;\n]/).map((x) => x.trim()).filter(Boolean)
  const contact = [['mail', p.email], ['phone', p.phone], ['pin', p.address]].filter(([, t]) => t)
  const extra = (cv.sections ?? []).map((x) => ({ ...x, items: x.items.filter((i) => i.title || i.subtitle || i.desc) })).filter((x) => x.items.length)
  const hasContent = p.summary || education.length || experience.length || extra.length || skills.length

  const style = { '--ac': s.color, '--on': lum(s.color) > 0.45 ? '#14171a' : '#fff', '--fs': s.size, '--pf': FONTS[s.font] }

  return (
    <div className={`paper ${s.layout} tpl-${s.template || 'classic'}`} style={style} aria-label="Resume preview">
      <header className="hd">
        {p.photo && <img className="ph" src={p.photo} alt="" />}
        <h1>{p.name || 'Your name'}</h1>
        <div className="ct">{contact.map(([ic, t]) => <span key={ic}><Icon name={ic} />{t}</span>)}</div>
      </header>
      <div className="mn">
        {!hasContent && <p className="empty">Your resume will appear here as you fill in the form.</p>}
        {p.summary && <p className="sum">{p.summary}</p>}
        {education.length > 0 && <Section title="Education">{education.map((e) => <Item key={e.id} e={e} head={e.school} sub={e.degree} />)}</Section>}
        {experience.length > 0 && <Section title="Professional experience">{experience.map((e) => <Item key={e.id} e={e} head={e.company} sub={e.title} />)}</Section>}
        {extra.map((x) => <Section key={x.id} title={x.title || 'Untitled'}>{x.items.map((i) => <Item key={i.id} e={i} head={i.title} sub={i.subtitle} />)}</Section>)}
        {skills.length > 0 && <Section title="Skills"><div className="tags">{skills.map((k) => <span key={k}>{k}</span>)}</div></Section>}
      </div>
    </div>
  )
}
