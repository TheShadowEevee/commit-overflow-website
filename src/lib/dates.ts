export const EVENT_START = "2025-12-22";
export const EVENT_END = "2026-01-12";
export const DAY_RESET_HOUR = 6;
export const DEFAULT_TIMEZONE = "America/Indiana/Indianapolis";

export function getCommitDay(timestamp: string, timezone: string): string {
    const date = new Date(timestamp);

    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const year = parseInt(parts.find((p) => p.type === "year")?.value ?? "1970", 10);
    const month = parseInt(parts.find((p) => p.type === "month")?.value ?? "01", 10);
    const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "01", 10);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);

    const commitDate = new Date(Date.UTC(year, month - 1, day));

    if (hour < DAY_RESET_HOUR) {
        commitDate.setUTCDate(commitDate.getUTCDate() - 1);
    }

    return commitDate.toISOString().split("T")[0];
}

export interface StreakResult {
    currentStreak: number;
    longestStreak: number;
    totalDays: number;
}

export function calculateStreaks(commitTimestamps: string[], timezone: string): StreakResult {
    if (commitTimestamps.length === 0) {
        return { currentStreak: 0, longestStreak: 0, totalDays: 0 };
    }

    const commitDaysSet = new Set<string>();
    for (const ts of commitTimestamps) {
        commitDaysSet.add(getCommitDay(ts, timezone));
    }

    const days = [...commitDaysSet].sort();
    const totalDays = days.length;

    if (days.length === 0) {
        return { currentStreak: 0, longestStreak: 0, totalDays: 0 };
    }

    if (days.length === 1) {
        return { currentStreak: 1, longestStreak: 1, totalDays: 1 };
    }

    let longestStreak = 1;
    let currentStreakLength = 1;

    for (let i = 1; i < days.length; i++) {
        const prevDate = new Date(days[i - 1]);
        const currDate = new Date(days[i]);
        const diffDays = Math.round(
            (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffDays === 1) {
            currentStreakLength++;
        } else {
            currentStreakLength = 1;
        }
        longestStreak = Math.max(longestStreak, currentStreakLength);
    }

    let streakEndingAtMostRecent = 1;
    for (let i = days.length - 1; i > 0; i--) {
        const prevDate = new Date(days[i - 1]);
        const currDate = new Date(days[i]);
        const diffDays = Math.round(
            (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffDays === 1) {
            streakEndingAtMostRecent++;
        } else {
            break;
        }
    }

    return {
        currentStreak: streakEndingAtMostRecent,
        longestStreak,
        totalDays,
    };
}

export function getEventProgress(): {
    currentDay: number;
    totalDays: number;
    daysRemaining: number;
    isActive: boolean;
    startDate: string;
    endDate: string;
} {
    const now = new Date();
    const start = new Date(EVENT_START + "T12:00:00");
    const end = new Date(EVENT_END + "T12:00:00");

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (now < start) {
        return {
            currentDay: 0,
            totalDays,
            daysRemaining: totalDays,
            isActive: false,
            startDate: EVENT_START,
            endDate: EVENT_END,
        };
    }

    if (now > end) {
        return {
            currentDay: totalDays,
            totalDays,
            daysRemaining: 0,
            isActive: false,
            startDate: EVENT_START,
            endDate: EVENT_END,
        };
    }

    const currentDay = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysRemaining = totalDays - currentDay;

    return {
        currentDay,
        totalDays,
        daysRemaining,
        isActive: true,
        startDate: EVENT_START,
        endDate: EVENT_END,
    };
}

export function getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const current = new Date(startDate + "T12:00:00");
    const end = new Date(endDate + "T12:00:00");

    while (current <= end) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, "0");
        const day = String(current.getDate()).padStart(2, "0");
        dates.push(`${year}-${month}-${day}`);
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

export function relativeTime(timestamp: string): string {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diffSeconds = Math.floor((now - then) / 1000);

    if (diffSeconds < 60) return "just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
}
