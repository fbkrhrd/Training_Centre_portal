"use client";

import { useActionState } from "react";
import type { AppRole } from "@/features/auth/types";
import type { Dictionary } from "@/i18n/dictionaries";
import { initialUserActionState } from "./action-state";
import { createUserAction } from "./actions";

type DepartmentOption = { id: string; name: string };

export function UserForm({
  departments,
  actorRole,
  dictionary,
}: {
  departments: DepartmentOption[];
  actorRole: AppRole;
  dictionary: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    createUserAction,
    initialUserActionState,
  );

  return (
    <form className="user-form" action={formAction}>
      <label>
        <span>{dictionary.employeeNo}</span>
        <input name="employeeNo" required />
      </label>
      <label>
        <span>{dictionary.fullName}</span>
        <input name="fullName" required />
      </label>
      <label>
        <span>{dictionary.department}</span>
        <select name="departmentId" defaultValue="">
          <option value="">-</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{dictionary.companyEmail}</span>
        <input name="companyEmail" type="email" required />
      </label>
      <label>
        <span>{dictionary.role}</span>
        <select name="role" defaultValue="participant">
          <option value="participant">{dictionary.participant}</option>
          {actorRole === "system_admin" ? (
            <>
              <option value="education_manager">{dictionary.educationManager}</option>
              <option value="system_admin">{dictionary.systemAdmin}</option>
            </>
          ) : null}
        </select>
      </label>
      <label>
        <span>{dictionary.preferredLocale}</span>
        <select name="preferredLocale" defaultValue="ko">
          <option value="ko">{dictionary.korean}</option>
          <option value="en">{dictionary.english}</option>
        </select>
      </label>
      <input name="employmentStatus" type="hidden" value="active" />
      {state.message ? (
        <p
          className={`form-message user-form__message ${state.status === "error" ? "form-message--error" : "form-message--success"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      <button className="button button--primary user-form__submit" disabled={pending}>
        {pending ? dictionary.creatingAccount : dictionary.createAccount}
      </button>
    </form>
  );
}
