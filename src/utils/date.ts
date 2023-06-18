import { DateTime, type Duration } from "luxon";

const myFormat = 'yyyy-MM-dd\'T\'HH:mm';

export const dateFromBackend = (date: string) => DateTime.fromJSDate(new Date(date)).setZone(
	Intl.DateTimeFormat().resolvedOptions().timeZone
).toFormat(myFormat)

export const toBackendDate = (date: string) => DateTime.fromJSDate(new Date(date)).setZone(
	Intl.DateTimeFormat().resolvedOptions().timeZone
).toJSDate()


export const isElapsedTimesBetweenDatesGreaterThanDuration = (startDate: Date, endDate: Date, duration: Duration) => {
	const diff = DateTime.fromJSDate(endDate).diff(DateTime.fromJSDate(startDate));
	return diff > duration;
}