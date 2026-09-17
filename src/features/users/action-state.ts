export type UserActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export const initialUserActionState: UserActionState = { status: "idle" };
