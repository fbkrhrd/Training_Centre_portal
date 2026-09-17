const employeeNoPattern = /^[a-z0-9_-]{3,32}$/;
const domainPattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export function normalizeEmployeeNo(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (!employeeNoPattern.test(normalized)) {
    throw new Error("사번 형식이 올바르지 않습니다.");
  }

  return normalized;
}

export function employeeNoToAuthEmail(
  employeeNo: string,
  domain: string,
): string {
  const normalizedDomain = domain.trim().toLowerCase();

  if (!domainPattern.test(normalizedDomain)) {
    throw new Error("내부 인증 도메인 형식이 올바르지 않습니다.");
  }

  return `${normalizeEmployeeNo(employeeNo)}@${normalizedDomain}`;
}
