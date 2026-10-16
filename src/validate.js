// Gentle checks: they only show hints, they never block editing or exporting.
export const validEmail = (v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
export const validPhone = (v) => !v.trim() || /^\+?[\d\s().\-x]{5,}$/.test(v.trim())

// "08/2020" or "2020" -> a comparable number, otherwise null
const num = (s) => {
  const t = (s || '').trim()
  let m = /^(\d{1,2})\/(\d{4})$/.exec(t)
  if (m) return +m[1] >= 1 && +m[1] <= 12 ? +m[2] * 12 + +m[1] : null
  m = /^(\d{4})$/.exec(t)
  return m ? +m[1] * 12 + 1 : null
}

export function dateHint(start, end) {
  const s = (start || '').trim(), e = (end || '').trim()
  const startOk = !s || num(s) !== null
  const endOk = !e || /^present$/i.test(e) || num(e) !== null
  if (!startOk || !endOk) return 'Use MM/YYYY or just the year, for example 08/2020.'
  const a = num(s), b = num(e)
  return a !== null && b !== null && b < a ? 'The end date is before the start date.' : ''
}
