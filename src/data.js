export const VERSION = 2 // bump when the saved shape changes, and extend migrate()
export const uid = () => Math.random().toString(36).slice(2, 9)
const settings = { template: 'classic', layout: 't', color: '#0f364d', font: 'sans', size: 1 }

export const blank = () => ({
  personal: { name: '', email: '', phone: '', address: '', summary: '', photo: '' },
  version: VERSION, education: [], experience: [], sections: [], skills: '', settings: { ...settings },
})

export const example = () => ({
  personal: {
    name: 'Jesse Pinkman',
    email: 'jessepinkman@breakingbad.world',
    phone: '1483-369',
    address: '9809 Margo Street, Albuquerque, New Mexico 87104',
    summary: 'Street-smart Operations Lead and Master Meth Cook with hands-on experience co-founding and scaling a multi-million dollar underground empire. Transitioned from a low-level independent contractor into a premier manufacturing specialist trained by a top-tier chemist. Exceptional resilience, hands-on problem-solving skills, and a proven ability to keep production moving when everything goes completely wrong. Yo, science.',
    photo: '',
  },
  version: VERSION,
  education: [
    { id: uid(), school: 'J. P. Wynne High School', degree: 'Degree in survival, grief, and "applied science."', start: '08/2003', end: '', location: 'Albuquerque, New Mexico' },
  ],
  experience: [
    { id: uid(), company: "Jack Welker's Neo-Nazi Compound", title: 'Product Purity Maintainer', start: '2012', end: '2013', location: 'Albuquerque, New Mexico', desc: '- Cooked the blue stuff at gunpoint while chained to a ceiling track system.' },
    { id: uid(), company: 'Los Pollos Hermanos Empire', title: 'Cook', start: '2010', end: '2011', location: 'Albuquerque, New Mexico', desc: '- Worked in a multi-million dollar underground lab hidden beneath an industrial laundry service.' },
  ],
  sections: [
    { id: uid(), title: 'Projects', items: [
      { id: uid(), title: 'Teaching the Cartel How to Clean', subtitle: '', start: '2010', end: '2011', location: '', desc: '- Cussed them out for running a dirty lab, took over the equipment, and cooked a perfect 96.2% batch on the first try.' },
    ] },
  ],
  skills: 'Industrial Chemical Synthesis, Product Purification & Crystallization, Laboratory Equipment Calibration, Hazardous Material (Hazmat) Handling, Mass Metrics & Precision Measurement',
  settings: { ...settings },
})


// relative luminance, used to pick light/dark text on the accent color
export const lum = (h) => {
  const n = parseInt(h.slice(1), 16)
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

// Accepts any saved resume (v1 had no version or sections) and returns the current shape, or null if it isn't a resume.
export const migrate = (d) => {
  if (!d || typeof d !== 'object' || !d.personal) return null
  const base = blank()
  return {
    ...base, ...d,
    personal: { ...base.personal, ...d.personal },
    settings: { ...base.settings, ...d.settings },
    education: d.education ?? [], experience: d.experience ?? [],
    sections: Array.isArray(d.sections) ? d.sections : [],
    version: VERSION,
  }
}
