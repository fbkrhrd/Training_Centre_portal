"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { initialUserActionState } from "./action-state";
import { updateUserProfileAction } from "./actions";

type DepartmentOption = { id: string; name: string };
type EditableProfile = {
  id: string;
  fullName: string;
  departmentId: string | null;
  companyEmail: string;
  grade: string | null;
  jobTitle: string | null;
  mobilePhone: string | null;
  hiredOn: string | null;
  preferredLocale: "ko" | "en";
};

export function EditUserForm({ profile, departments, dictionary }: {
  profile: EditableProfile;
  departments: DepartmentOption[];
  dictionary: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(updateUserProfileAction, initialUserActionState);
  return (
    <form className="user-form" action={formAction}>
      <input type="hidden" name="userId" value={profile.id} />
      <label><span>{dictionary.fullName}</span><input name="fullName" defaultValue={profile.fullName} required /></label>
      <label><span>{dictionary.department}</span><select name="departmentId" defaultValue={profile.departmentId ?? ""}>
        <option value="">-</option>
        {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
      </select></label>
      <label><span>{dictionary.companyEmail}</span><input name="companyEmail" type="email" defaultValue={profile.companyEmail} required /></label>
      <label><span>{dictionary.grade}</span><input name="grade" defaultValue={profile.grade ?? ""} /></label>
      <label><span>{dictionary.jobTitle}</span><input name="jobTitle" defaultValue={profile.jobTitle ?? ""} /></label>
      <label><span>{dictionary.mobilePhone}</span><input name="mobilePhone" defaultValue={profile.mobilePhone ?? ""} /></label>
      <label><span>{dictionary.hiredOn}</span><input name="hiredOn" type="date" defaultValue={profile.hiredOn ?? ""} /></label>
      <label><span>{dictionary.preferredLocale}</span><select name="preferredLocale" defaultValue={profile.preferredLocale}>
        <option value="ko">{dictionary.korean}</option><option value="en">{dictionary.english}</option>
      </select></label>
      {state.message ? <p className={`form-message user-form__message ${state.status === "error" ? "form-message--error" : "form-message--success"}`} role="status">{state.message}</p> : null}
      <button className="button button--primary user-form__submit" disabled={pending}>{pending ? dictionary.updatingAccount : dictionary.updateAccount}</button>
    </form>
  );
}
