"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/features/auth/actions";
import { initialAuthActionState } from "@/features/auth/action-state";
import type { Dictionary } from "@/i18n/dictionaries";

export function PasswordForm({ dictionary }: { dictionary: Dictionary }) {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialAuthActionState,
  );

  return (
    <form className="auth-form auth-form--compact" action={formAction}>
      <label>
        <span>{dictionary.newPassword}</span>
        <input name="password" type="password" autoComplete="new-password" />
      </label>
      <label>
        <span>{dictionary.passwordConfirm}</span>
        <input
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
        />
      </label>
      {state.message ? (
        <p
          className={`form-message ${state.status === "error" ? "form-message--error" : "form-message--success"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      <button className="button button--primary" disabled={pending}>
        {dictionary.changePassword}
      </button>
    </form>
  );
}
