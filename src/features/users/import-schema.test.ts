import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { parseUserWorkbook } from "./import-schema";

describe("parseUserWorkbook", () => {
  it("parses a valid CSV row", async () => {
    const file = await readFile("tests/fixtures/users-valid.csv");
    const result = parseUserWorkbook(file, ".csv");
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0]?.employeeNo).toBe("a1024");
  });

  it("reports row number and field errors", async () => {
    const file = await readFile("tests/fixtures/users-invalid.csv");
    const result = parseUserWorkbook(file, ".csv");
    expect(result.errors[0]).toMatchObject({
      rowNumber: 2,
      field: "companyEmail",
    });
  });

  it("rejects duplicate employee numbers in one file", async () => {
    const file = await readFile("tests/fixtures/users-valid.csv");
    const duplicate = Buffer.concat([file, Buffer.from("A1024,김철수,,kim@example.com,재직,,,,,참가자,ko\n")]);
    const result = parseUserWorkbook(duplicate, ".csv");
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rowNumber: 3, field: "employeeNo" }),
      ]),
    );
  });
});
