import { DayOfWeek, Frequency, updateScheduleDto } from "@/admins/dto/update-schedule.dto";
import { BACKOFF_DELAY, RETRY_LIMIT } from "../constants/common";
import { HttpException } from "@nestjs/common";


export const retryWithBackoff = async <T>(fn: () => Promise<T>, retryCount = 0): Promise<T> => {
    try {
        const res = await fn();
        return res;
    } catch (error) {
        if (retryCount < RETRY_LIMIT) {
            // const delay = BACKOFF_DELAY * Math.pow(2, retryCount);
            const delay = BACKOFF_DELAY;
            console.error(`Error occurred, retrying in ${delay}ms (attempt ${retryCount + 1}):`, error);
            await new Promise(res => setTimeout(res, delay));
            return retryWithBackoff(fn, retryCount + 1);
        } else {
            console.error(`Max retries reached:`, error);

            throw new HttpException(
                {
                    status: 500,
                    error: "Internal Server Error",
                    message: "Max retries reached",
                },
                500,
            );

            // throw error;
        }
    }
};


export const toProperCase = (text: string) => {
    const res = text
        .split(" ") // Split by spaces
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
        .join(" "); // Rejoin words
    console.log("res of propse", res.length)
    return res
};


export const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-GB"); // Ensures HH:mm:ss format (24-hour clock)
};

export function cleanString(value: string | undefined): string {
    if (!value) return ''; // Handle empty values
    return value
        .trim()                         // Remove spaces at start & end
        .replace(/^["']|["']$/g, '')    // Remove surrounding quotes
        .replace(/\s+/g, ' ')           // Normalize multiple spaces to one
        .normalize("NFC");              // Fix encoding issues
}


export function stringifyIfNumber(value: string | number): string {
    return typeof value === "number" ? value.toString() : value;
}

export function extractFromProgressText(text: string, regex: any) {
    const match = text.match(regex);
    return match ? match[1].trim() : '-';
}

export function getNextSyncDate(schedule: {
    frequency: string;
    timeOfDay: string;
    dayOfMonth?: string;
    dayOfWeek?: string;
}): string {
    const now = new Date();

    const [hoursStr, minutesStr] = schedule.timeOfDay !== 'not set'
        ? schedule.timeOfDay.split(':')
        : ['15', '30']; // Default to 15:30

    const hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);

    let nextDate = new Date(now);
    nextDate.setSeconds(0);
    nextDate.setMilliseconds(0);
    nextDate.setHours(hours, minutes);

    switch (schedule.frequency.toUpperCase()) {
        case 'DAILY':
            if (nextDate <= now) nextDate.setDate(nextDate.getDate() + 1);
            break;

        case 'WEEKLY':
            const dayMap: Record<DayOfWeek, number> = {
                SUNDAY: 0,
                MONDAY: 1,
                TUESDAY: 2,
                WEDNESDAY: 3,
                THURSDAY: 4,
                FRIDAY: 5,
                SATURDAY: 6
            };

            const targetDay = schedule.dayOfWeek && schedule.dayOfWeek !== 'not set'
                ? dayMap[schedule.dayOfWeek as DayOfWeek]
                : 0; // Default to Sunday


            const currentDay = now.getDay();
            const daysUntilNext = (targetDay - currentDay + 7) % 7 || 7;

            nextDate.setDate(now.getDate() + daysUntilNext);
            break;

        case 'MONTHLY':
            const day = schedule.dayOfMonth && schedule.dayOfMonth !== 'not set'
                ? parseInt(schedule.dayOfMonth)
                : 1;

            nextDate.setDate(day);

            if (nextDate <= now) {
                nextDate.setMonth(nextDate.getMonth() + 1);
                nextDate.setDate(day);
            }
            break;

        case 'MANUAL':
        default:
            return 'Manual sync – no next date set';
    }

    const month = String(nextDate.getMonth() + 1).padStart(2, '0');
    const day = String(nextDate.getDate()).padStart(2, '0');
    const year = nextDate.getFullYear();
    const h = String(nextDate.getHours()).padStart(2, '0');
    const m = String(nextDate.getMinutes()).padStart(2, '0');

    return `${month}-${day}-${year} @ ${h}:${m}`;
}


export function buildCronExpression(dto: updateScheduleDto): string {
    // Default values
    let seconds = '0'; // Set to 0 if not specified (common practice)
    let minutes = '0'; // Default 0 minutes
    let hours = '0';   // Default 0 hours
    let dayOfMonth = '*'; // Every day by default
    let month = '*';      // Every month by default
    let dayOfWeek = '*';  // Every day of week by default

    if (dto.timeOfDay && dto.timeOfDay !== 'not set') {
        const [h, m] = dto.timeOfDay.split(':').map(Number);
        if (!isNaN(h)) hours = h.toString();
        if (!isNaN(m)) minutes = m.toString();
    }

    if (dto.dayOfMonth && dto.dayOfMonth !== 'not set') {
        dayOfMonth = dto.dayOfMonth.toString();
    }

    if (dto.dayOfWeek && dto.dayOfWeek !== 'not set') {
        dayOfWeek = dto.dayOfWeek; // Will be MONDAY, TUESDAY, etc.
    }

    if (dto.frequency && dto.frequency !== 'not set') {
        switch (dto.frequency) {
            case Frequency.DAILY:
                dayOfMonth = '*';
                dayOfWeek = '*';
                break;
            case Frequency.WEEKLY:
                dayOfMonth = '*';
                if (!dto.dayOfWeek || dto.dayOfWeek === 'not set') {
                    throw new Error('Weekly frequency requires a valid dayOfWeek.');
                }
                break;
            case Frequency.MONTHLY:
                dayOfWeek = '*';
                if (!dto.dayOfMonth || dto.dayOfMonth === 'not set') {
                    throw new Error('Monthly frequency requires a valid dayOfMonth.');
                }
                break;
            case Frequency.MANUAL:
                throw new Error('Manual frequency does not support cron scheduling.');
        }
    }

    return `${seconds} ${minutes} ${hours} ${dayOfMonth} ${month} ${dayOfWeek}`;
}
