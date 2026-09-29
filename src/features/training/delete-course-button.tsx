"use client";

import { deleteCourseAction } from "./actions";

export function DeleteCourseButton({ courseId }: { courseId: string }) {
  return (
    <form
      action={deleteCourseAction}
      onSubmit={(event) => {
        if (!window.confirm("차수가 없는 과정만 삭제할 수 있습니다. 이 과정을 삭제할까요?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="courseId" value={courseId} />
      <button className="button button--quiet" type="submit">삭제</button>
    </form>
  );
}
