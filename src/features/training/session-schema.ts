import { z } from "zod";

const dateTime = z.iso.datetime();

export const sessionInputSchema = z
  .object({
    courseId: z.string().uuid(),
    sessionNo: z.coerce.number().int().positive(),
    deliveryMode: z.enum(["in_person", "online", "blended"]),
    location: z.string().trim().max(300).optional(),
    onlineUrl: z.url().optional(),
    startsAt: dateTime,
    endsAt: dateTime,
    capacity: z.coerce.number().int().positive(),
    applicationOpensAt: dateTime,
    applicationClosesAt: dateTime,
    cancellationClosesAt: dateTime,
  })
  .superRefine((value, context) => {
    if (value.deliveryMode !== "online" && !value.location) {
      context.addIssue({ code: "custom", path: ["location"], message: "대면 장소를 입력해 주세요." });
    }
    if (value.deliveryMode !== "in_person" && !value.onlineUrl) {
      context.addIssue({ code: "custom", path: ["onlineUrl"], message: "온라인 접속 링크를 입력해 주세요." });
    }
    if (new Date(value.endsAt) <= new Date(value.startsAt)) {
      context.addIssue({ code: "custom", path: ["endsAt"], message: "종료 일시는 시작 일시보다 늦어야 합니다." });
    }
    if (new Date(value.applicationClosesAt) < new Date(value.applicationOpensAt)) {
      context.addIssue({ code: "custom", path: ["applicationClosesAt"], message: "신청 마감은 신청 시작 이후여야 합니다." });
    }
  });

export type SessionInput = z.infer<typeof sessionInputSchema>;
