export type ApprovedParticipantInput = {
  fullName: string | null;
  employeeNo: string | null;
  department: string | null;
  sessionNo: number | null;
  decidedAt: string | null;
};

export function toApprovedParticipantRow(input: ApprovedParticipantInput) {
  return {
    fullName: input.fullName ?? "-",
    employeeNo: input.employeeNo ?? "-",
    department: input.department ?? "-",
    sessionNo: input.sessionNo ?? "-",
    approvedAt: input.decidedAt
      ? new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).format(new Date(input.decidedAt))
      : "-",
  };
}
