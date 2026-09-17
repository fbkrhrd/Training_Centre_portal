import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { parseUserWorkbook } from "./import-schema";

describe("parseUserWorkbook", () => {
  it("parses a valid CSV row", async () => {
    const file = await readFile("tests/fixtures/users-valid.csv");
    const result = await parseUserWorkbook(file, ".csv");
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0]?.employeeNo).toBe("a1024");
  });

  it("reports row number and field errors", async () => {
    const file = await readFile("tests/fixtures/users-invalid.csv");
    const result = await parseUserWorkbook(file, ".csv");
    expect(result.errors[0]).toMatchObject({
      rowNumber: 2,
      field: "companyEmail",
    });
  });

  it("rejects duplicate employee numbers in one file", async () => {
    const file = await readFile("tests/fixtures/users-valid.csv");
    const duplicate = Buffer.concat([file, Buffer.from("A1024,김철수,,kim@example.com,재직,,,,,참가자,ko\n")]);
    const result = await parseUserWorkbook(duplicate, ".csv");
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rowNumber: 3, field: "employeeNo" }),
      ]),
    );
  });

  it("rejects an unknown employment status instead of activating the user", async () => {
    const file = Buffer.from("사번,이름,부서,이메일,재직상태,직급,직책,휴대전화,입사일,역할,언어\nA1025,김철수,,kim@example.com,퇴직,,,,,참가자,ko\n");
    const result = await parseUserWorkbook(file, ".csv");
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ rowNumber: 2, field: "employmentStatus" }),
    ]));
  });
});
