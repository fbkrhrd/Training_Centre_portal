const KST_OFFSET_MINUTES = 9 * 60;
const localDateTimePattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

function parseKstInput(input: string) {
  const match = localDateTimePattern.exec(input);
  if (!match) throw new Error("유효한 한국 표준시 일시를 입력해 주세요.");

  const [, year, month, day, hour, minute, second = "00"] = match;
  const milliseconds = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute) - KST_OFFSET_MINUTES,
    Number(second),
  );
  const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) {
    throw new Error("유효한 한국 표준시 일시를 입력해 주세요.");
  }
  return date;
}

export function toKstIso(input: string) {
  return parseKstInput(input).toISOString();
}

export function formatKst(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const kst = new Date(date.getTime() + KST_OFFSET_MINUTES * 60_000);
  const pad = (part: number) => String(part).padStart(2, "0");
  return [
    [kst.getUTCFullYear(), pad(kst.getUTCMonth() + 1), pad(kst.getUTCDate())].join("-"),
    [pad(kst.getUTCHours()), pad(kst.getUTCMinutes())].join(":"),
  ].join(" ");
}

export function isDeadlineOpen(deadline: string | Date, now: Date) {
  return now.getTime() <= new Date(deadline).getTime();
}
