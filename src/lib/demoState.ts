export function resetDemoState() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith('specialist.'))
    .forEach((key) => localStorage.removeItem(key))
}
