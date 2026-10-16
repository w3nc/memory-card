// Centre-crops to a square and shrinks, so the saved file and browser storage stay small (~15 KB).
export async function resizePhoto(file, size = 256) {
  if (!file.type.startsWith('image/')) throw new Error('Not an image')
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = rej
      i.src = url
    })
    const side = Math.min(img.width, img.height)
    const c = document.createElement('canvas')
    c.width = c.height = size
    c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
    return c.toDataURL('image/jpeg', 0.85)
  } finally {
    URL.revokeObjectURL(url)
  }
}
