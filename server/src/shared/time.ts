export const nowString = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

export const addSeconds = (seconds: number) => new Date(Date.now() + seconds * 1000)

export const toDateString = (date: Date) => date.toISOString().slice(0, 19).replace('T', ' ')
