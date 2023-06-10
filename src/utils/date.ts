import { DateTime } from "luxon";

const myFormat = 'yyyy-MM-dd\'T\'HH:mm';

export const dateFromBackend = (date: string) => DateTime.fromJSDate(new Date(date)).setZone(
	Intl.DateTimeFormat().resolvedOptions().timeZone
).toFormat(myFormat)

export const toBackendDate = (date: string) => DateTime.fromJSDate(new Date(date)).setZone(
	Intl.DateTimeFormat().resolvedOptions().timeZone
).toJSDate()