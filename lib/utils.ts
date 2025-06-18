import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Universal break times for all users
export interface BreakEntry {
  id: string;
  type: 'break';
  day: string;
  start_time: string;
  end_time: string;
  break_name: string;
  room: string;
}

export interface UniversalBreaks {
  lunchBreak: { start: string; end: string; name: string };
}

export const universalBreaks: UniversalBreaks = {
  lunchBreak: { start: '13:00', end: '14:00', name: 'Lunch Break' }
};

// Inject universal breaks into timetable data
export function injectUniversalBreaks<T extends { day: string; start_time: string; end_time: string }>(
  timetableData: T[],
  weekdays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
): (T | BreakEntry)[] {
  const breakEntries: BreakEntry[] = [];

  // Generate break entries for each weekday
  weekdays.forEach(day => {
    // Lunch Break (1:00 PM - 2:00 PM)
    breakEntries.push({
      id: `break-lunch-${day}`,
      type: 'break',
      day,
      start_time: universalBreaks.lunchBreak.start,
      end_time: universalBreaks.lunchBreak.end,
      break_name: universalBreaks.lunchBreak.name,
      room: 'Cafeteria'
    });
  });

  // Combine timetable data with break entries and sort by day and time
  const combined = [...timetableData, ...breakEntries];

  return combined.sort((a, b) => {
    // First sort by day
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayComparison = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);

    if (dayComparison !== 0) return dayComparison;

    // Then sort by start time
    const timeA = a.start_time.split(':').map(Number);
    const timeB = b.start_time.split(':').map(Number);

    const totalMinutesA = timeA[0] * 60 + timeA[1];
    const totalMinutesB = timeB[0] * 60 + timeB[1];

    return totalMinutesA - totalMinutesB;
  });
}

// Check if an entry is a break
export function isBreakEntry(entry: any): entry is BreakEntry {
  return entry.type === 'break';
}

// Format time for break display
export function formatBreakTime(time: string): string {
  const [hour, minute] = time.split(':');
  const hourNum = parseInt(hour);
  const ampm = hourNum >= 12 ? 'PM' : 'AM';
  const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
  return `${displayHour}:${minute} ${ampm}`;
}

// Check if current time is within a break period
export function isCurrentBreakTime(): { isBreak: boolean; breakName?: string } {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  for (const [key, breakInfo] of Object.entries(universalBreaks)) {
    const [startHour, startMin] = breakInfo.start.split(':').map(Number);
    const [endHour, endMin] = breakInfo.end.split(':').map(Number);

    const startTotalMinutes = startHour * 60 + startMin;
    const endTotalMinutes = endHour * 60 + endMin;

    if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes) {
      return { isBreak: true, breakName: breakInfo.name };
    }
  }

  return { isBreak: false };
}

// Generates a deterministic HSL color based on a given string (e.g., user name)
export function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    // Simple hash function
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  // Create hue from 0–360
  const hue = Math.abs(hash) % 360
  // Use constant saturation/lightness for pleasant pastel-ish colors
  return `hsl(${hue}, 70%, 60%)`
}
