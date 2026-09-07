import { passwordResetEmail, verificationEmail } from "./templates";

describe.each([
  ["verificationEmail", verificationEmail],
  ["passwordResetEmail", passwordResetEmail],
])("%s", (_name, template) => {
  it("puts the link in both bodies so a plain-text client can still act on it", () => {
    const content = template({ name: "Ada", url: "https://sundayboard.com/verify?token=abc" });

    expect(content.html).toContain("https://sundayboard.com/verify?token=abc");
    expect(content.text).toContain("https://sundayboard.com/verify?token=abc");
    expect(content.subject).not.toBe("");
  });

  it("escapes the name, which the user chose, before putting it in HTML", () => {
    const content = template({ name: "<script>alert(1)</script>", url: "https://sundayboard.com/verify" });

    expect(content.html).not.toContain("<script>");
    expect(content.html).toContain("&lt;script&gt;");
  });
});
