import { describe, expect, it } from "vitest";
import { toApprovedParticipantRow } from "./approved-participant-service";

describe("toApprovedParticipantRow", () => {
  it("formats an approved participant for the course roster", () => {
    expect(toApprovedParticipantRow({
      fullName: "홍길동",
      employeeNo: "2020010180",
      department: "인재개발팀",
      sessionNo: 3,
      decidedAt: "2026-09-29T03:00:00.000Z",
    })).toEqual({
      fullName: "홍길동",
      employeeNo: "2020010180",
      department: "인재개발팀",
      sessionNo: 3,
      approvedAt: "2026. 9. 29.",
    });
  });

  it("uses a dash when optional roster details are unavailable", () => {
    expect(toApprovedParticipantRow({
      fullName: null,
      employeeNo: null,
      department: null,
      sessionNo: null,
      decidedAt: null,
    })).toEqual({
      fullName: "-",
      employeeNo: "-",
      department: "-",
      sessionNo: "-",
      approvedAt: "-",
    });
  });
});
