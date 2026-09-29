const publicMessage = "데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";

type SupabaseResult<T> = {
  data: T;
  error: { message: string } | null;
};

export class PortalDataAccessError extends Error {
  constructor(operation: string, cause: Error) {
    super(publicMessage, { cause });
    this.name = "PortalDataAccessError";
    console.error(`Supabase data access failed: ${operation}`, cause);
  }
}

export function requireSupabaseData<T>(
  result: SupabaseResult<T>,
  operation: string,
): T {
  if (result.error) {
    throw new PortalDataAccessError(operation, new Error(result.error.message));
  }

  return result.data;
}
