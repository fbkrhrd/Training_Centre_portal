"use client";

import { useActionState } from "react";
import { loginAction } from "@/features/auth/actions";
import { initialAuthActionState } from "@/features/auth/action-state";
import type { Dictionary } from "@/i18n/dictionaries";

export function LoginForm({ dictionary }: { dictionary: Dictionary }) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialAuthActionState,
  );

  return (
    <form className="auth-form" action={formAction}>
      <label>
        <span>{dictionary.employeeNo}</span>
        <input name="employeeNo" autoComplete="username" required />
      </label>
      <label>
        <span>{dictionary.password}</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      {state.message ? (
        <p className="form-message form-message--error" role="alert">
          {state.message}
        </p>
      ) : null}
      <button className="button button--primary" disabled={pending}>
        {pending ? dictionary.signingIn : dictionary.signIn}
      </button>
    </form>
  );
}
