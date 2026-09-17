"use client";

import { startTransition, useActionState, useMemo, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { userImportAction } from "./import-actions";
import { initialUserImportState } from "./import-state";

export function UserImport({ dictionary }: { dictionary: Dictionary }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewedFile, setPreviewedFile] = useState<File | null>(null);
  const [state, dispatch, pending] = useActionState(
    userImportAction,
    initialUserImportState,
  );
  const errorCsv = useMemo(() => {
    const rows = ["행,필드,오류", ...state.errors.map((error) =>
      [error.rowNumber, error.field, `"${error.message.replaceAll('"', '""')}"`].join(","),
    )];
    return `data:text/csv;charset=utf-8,${encodeURIComponent(`\uFEFF${rows.join("\n")}`)}`;
  }, [state.errors]);

  function submit(intent: "preview" | "import") {
    if (!file) return;
    if (intent === "preview") setPreviewedFile(file);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("intent", intent);
    startTransition(() => dispatch(formData));
  }

  return (
    <div className="import-panel">
      <p>{dictionary.importGuide}</p>
      <code className="header-guide">
        사번, 이름, 부서, 이메일, 재직상태, 직급, 직책, 휴대전화, 입사일, 역할, 언어
      </code>
      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={(event) => {
          setFile(event.target.files?.[0] ?? null);
          setPreviewedFile(null);
        }}
      />
      <div className="button-row">
        <button
          className="button button--quiet"
          type="button"
          disabled={!file || pending}
          onClick={() => submit("preview")}
        >
          {dictionary.previewImport}
        </button>
        <button
          className="button button--primary"
          type="button"
          disabled={!file || file !== previewedFile || pending || state.status !== "ready"}
          onClick={() => submit("import")}
        >
          {dictionary.confirmImport}
        </button>
      </div>
      {state.status !== "idle" ? (
        <div className="import-summary">
          <span>{dictionary.validRows}: {state.validCount}</span>
          <span>{dictionary.errorRows}: {state.errors.length}</span>
          {state.status === "complete" ? (
            <span>{dictionary.createdRows}: {state.createdCount}</span>
          ) : null}
        </div>
      ) : null}
      {state.errors.length ? (
        <>
          <a className="text-link" href={errorCsv} download="user-import-errors.csv">
            {dictionary.downloadErrors}
          </a>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>행</th><th>필드</th><th>오류</th></tr></thead>
              <tbody>
                {state.errors.map((error, index) => (
                  <tr key={`${error.rowNumber}-${error.field}-${index}`}>
                    <td>{error.rowNumber}</td><td>{error.field}</td><td>{error.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
