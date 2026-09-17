import type { UserImportError } from "./import-schema";

export type UserImportActionState = {
  status: "idle" | "ready" | "error" | "complete";
  validCount: number;
  errors: UserImportError[];
  createdCount: number;
  failedCount: number;
};

export const initialUserImportState: UserImportActionState = {
  status: "idle",
  validCount: 0,
  errors: [],
  createdCount: 0,
  failedCount: 0,
};
