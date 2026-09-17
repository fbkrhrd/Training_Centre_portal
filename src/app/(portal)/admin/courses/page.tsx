import { requireUser } from "@/features/auth/require-user";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createCourseAction } from "@/features/training/actions";

const managers = ["system_admin", "education_manager"] as const;

export default async function CoursesPage() {
  await requireUser(managers);
  const supabase = createAdminSupabaseClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id,title_ko,title_en,is_published,training_categories(name_ko)")
    .order("created_at", { ascending: false });
  const { data: categories } = await supabase
    .from("training_categories")
    .select("id,name_ko")
    .eq("is_active", true)
    .order("name_ko");

  return <div className="content-panel content-panel--wide">
    <header className="page-heading"><p className="dashboard-intro__label">TRAINING MANAGEMENT</p><h1>교육과정 관리</h1><p>교육과정과 차수를 개설하고 담당자를 운영합니다.</p></header>
    <section className="content-card"><h2>교육과정 등록</h2>
      <form className="user-form" action={createCourseAction}>
        <label><span>국문 과정명</span><input name="titleKo" required /></label>
        <label><span>영문 과정명</span><input name="titleEn" required /></label>
        <label><span>카테고리</span><select name="categoryId" defaultValue=""><option value="">-</option>{categories?.map((category) => <option key={category.id} value={category.id}>{category.name_ko}</option>)}</select></label>
        <label><span>국문 설명</span><input name="descriptionKo" /></label>
        <label><span>영문 설명</span><input name="descriptionEn" /></label>
        <label><span>공개 여부</span><select name="isPublished" defaultValue="false"><option value="false">작성</option><option value="true">게시</option></select></label>
        <button className="button button--primary user-form__submit">교육과정 생성</button>
      </form>
    </section>
    <section className="content-card content-card--table"><h2>교육과정 목록</h2><div className="table-scroll"><table className="data-table"><thead><tr><th>국문 과정명</th><th>영문 과정명</th><th>카테고리</th><th>상태</th></tr></thead><tbody>{courses?.map((course) => <tr key={course.id}><td>{course.title_ko}</td><td>{course.title_en}</td><td>{(course.training_categories as { name_ko?: string } | null)?.name_ko ?? "-"}</td><td>{course.is_published ? "게시" : "작성"}</td></tr>)}{!courses?.length && <tr><td colSpan={4}>등록된 교육과정이 없습니다.</td></tr>}</tbody></table></div></section>
  </div>;
}
