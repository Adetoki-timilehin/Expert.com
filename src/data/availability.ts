export type CallSlot = {
  id: string
  date: Date
  dayLabel: string   // "Monday 27 Oct"
  timeLabel: string  // "9:00 am"
}

// Weekday availability windows (hour, 24h)
const weeklySchedule: Record<number, { start: number; end: number }> = {
  1: { start: 9, end: 17 },
  2: { start: 9, end: 17 },
  3: { start: 9, end: 17 },
  4: { start: 9, end: 17 },
  5: { start: 9, end: 13 },
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatTimeLabel(hour: number, mins: number): string {
  const suffix = hour < 12 ? 'am' : 'pm'
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  const m = mins === 0 ? '00' : '30'
  return `${h}:${m} ${suffix}`
}

function formatDayLabel(date: Date): string {
  return `${DAY_NAMES[date.getDay()]} ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`
}

export function generateSlots(daysAhead = 10): CallSlot[] {
  const slots: CallSlot[] = []
  const now = new Date()
  let slotIndex = 0

  for (let d = 1; d <= daysAhead; d++) {
    const date = new Date(now)
    date.setDate(date.getDate() + d)
    date.setHours(0, 0, 0, 0)

    const schedule = weeklySchedule[date.getDay()]
    if (!schedule) continue

    for (let hour = schedule.start; hour < schedule.end; hour++) {
      for (const mins of [0, 30]) {
        // Mark roughly 40% of slots as already booked using a deterministic pattern
        const available = slotIndex % 5 !== 2 && slotIndex % 7 !== 4
        slotIndex++
        if (!available) continue

        const slotDate = new Date(date)
        slotDate.setHours(hour, mins, 0, 0)

        slots.push({
          id: slotDate.toISOString(),
          date: slotDate,
          dayLabel: formatDayLabel(slotDate),
          timeLabel: formatTimeLabel(hour, mins),
        })
      }
    }
  }

  return slots
}

export function groupSlotsByDay(slots: CallSlot[]): { dayLabel: string; slots: CallSlot[] }[] {
  const map = new Map<string, CallSlot[]>()
  for (const slot of slots) {
    const existing = map.get(slot.dayLabel)
    if (existing) existing.push(slot)
    else map.set(slot.dayLabel, [slot])
  }
  return Array.from(map.entries()).map(([dayLabel, slots]) => ({ dayLabel, slots }))
}
