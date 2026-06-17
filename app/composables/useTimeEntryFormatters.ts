import { Temporal } from "@js-temporal/polyfill"

function toInstant(dt: string | Date): Temporal.Instant {
  return typeof dt === "string" ? Temporal.Instant.from(dt) : Temporal.Instant.fromEpochMilliseconds(dt.getTime())
}

export function useTimeEntryFormatters() {
  function formatEntryTime(entry: { startTime?: string | Date | null; endTime?: string | Date | null }): string {
    if (!entry.startTime || !entry.endTime) return ""

    const timeZone = Temporal.Now.timeZoneId()
    const start = toInstant(entry.startTime).toZonedDateTimeISO(timeZone)
    const end = toInstant(entry.endTime).toZonedDateTimeISO(timeZone)

    const startTime = `${String(start.hour).padStart(2, "0")}:${String(start.minute).padStart(2, "0")}`
    const endTime = `${String(end.hour).padStart(2, "0")}:${String(end.minute).padStart(2, "0")}`

    return `${startTime} - ${endTime}`
  }

  function formatEntryDuration(entry: { startTime?: string | Date | null; endTime?: string | Date | null }): string {
    if (!entry.startTime || !entry.endTime) return ""

    const duration = toInstant(entry.endTime).since(toInstant(entry.startTime))

    const hours = Math.floor(duration.total("hours"))
    const minutes = Math.floor(duration.total("minutes")) % 60
    const seconds = Math.floor(duration.total("seconds")) % 60

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  function formatDurationFromSeconds(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = Math.floor(totalSeconds % 60)
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  function getEntryDurationSeconds(entry: { startTime?: string | Date | null; endTime?: string | Date | null }): number {
    if (!entry.startTime || !entry.endTime) return 0
    return Math.floor(toInstant(entry.endTime).since(toInstant(entry.startTime)).total("seconds"))
  }

  function getEntryDate(entry: { startTime?: string | Date | null }): string {
    if (!entry.startTime) return ""
    const timeZone = Temporal.Now.timeZoneId()
    const zdt = toInstant(entry.startTime).toZonedDateTimeISO(timeZone)
    return `${zdt.year}-${String(zdt.month).padStart(2, "0")}-${String(zdt.day).padStart(2, "0")}`
  }

  function formatDateLabel(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number)
    const zdt = Temporal.PlainDate.from({ year: y, month: m, day: d }).toZonedDateTime(Temporal.Now.timeZoneId())
    const today = Temporal.Now.plainDateISO()
    const yesterday = today.subtract({ days: 1 })

    if (zdt.toPlainDate().equals(today)) return "Today"
    if (zdt.toPlainDate().equals(yesterday)) return "Yesterday"

    const dayName = zdt.toLocaleString("en-US", { weekday: "short" })
    const monthDay = zdt.toLocaleString("en-US", { month: "short", day: "numeric" })
    return `${dayName}, ${monthDay}`
  }

  function formatDateInputValue(dt: string | Date | null | undefined): string {
    if (!dt) return ""
    const timeZone = Temporal.Now.timeZoneId()
    const zdt = toInstant(dt).toZonedDateTimeISO(timeZone)
    return `${zdt.year}-${String(zdt.month).padStart(2, "0")}-${String(zdt.day).padStart(2, "0")}`
  }

  function toTimeInputValue(dt: string | Date | null | undefined): string {
    if (!dt) return ""
    const timeZone = Temporal.Now.timeZoneId()
    const zdt = toInstant(dt).toZonedDateTimeISO(timeZone)
    return `${String(zdt.hour).padStart(2, "0")}:${String(zdt.minute).padStart(2, "0")}:${String(zdt.second).padStart(2, "0")}`
  }

  // Apply a date (YYYY-MM-DD) to an existing datetime, returning ISO string
  function applyDateToEntry(entry: { startTime?: string | Date | null; endTime?: string | Date | null }, dateValue: string): { startTime: string | null; endTime: string | null } {
    const timeZone = Temporal.Now.timeZoneId()
    const [y, m, d] = dateValue.split("-").map(Number)

    let newStart: string | null = null
    let newEnd: string | null = null

    if (entry.startTime) {
      const startZdt = toInstant(entry.startTime).toZonedDateTimeISO(timeZone)
      // Use with() to replace year/month/day while keeping time components
      newStart = startZdt.with({ year: y, month: m, day: d }).toInstant().toString()
    }
    if (entry.endTime) {
      const endZdt = toInstant(entry.endTime).toZonedDateTimeISO(timeZone)
      newEnd = endZdt.with({ year: y, month: m, day: d }).toInstant().toString()
    }

    return { startTime: newStart, endTime: newEnd }
  }

  return {
    formatEntryTime,
    formatEntryDuration,
    formatDurationFromSeconds,
    getEntryDurationSeconds,
    getEntryDate,
    formatDateLabel,
    formatDateInputValue,
    toTimeInputValue,
    applyDateToEntry
  }
}
