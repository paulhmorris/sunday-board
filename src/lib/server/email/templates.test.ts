import { passwordResetEmail, verificationCodeEmail } from "./templates";

describe("passwordResetEmail", () => {
  it("puts the link in both bodies so a plain-text client can still act on it", () => {
    const content = passwordResetEmail({ name: "Ada", url: "https://sundayboard.com/reset?token=abc" });

    expect(content.html).toContain("https://sundayboard.com/reset?token=abc");
    expect(content.text).toContain("https://sundayboard.com/reset?token=abc");
    expect(content.subject).not.toBe("");
  });

  it("escapes the name, which the user chose, before putting it in HTML", () => {
    const content = passwordResetEmail({ name: "<script>alert(1)</script>", url: "https://sundayboard.com/reset" });

    expect(content.html).not.toContain("<script>");
    expect(content.html).toContain("&lt;script&gt;");
  });
});

describe("verificationCodeEmail", () => {
  it("puts the code in both bodies and in the subject", () => {
    const content = verificationCodeEmail({ code: "123456", expiresInMinutes: 10 });

    expect(content.html).toContain("123456");
    expect(content.text).toContain("123456");
    expect(content.subject).toContain("123456");
  });

  it("tells the reader how long the code lasts", () => {
    const content = verificationCodeEmail({ code: "123456", expiresInMinutes: 10 });

    expect(content.text).toContain("10 minutes");
  });
});
