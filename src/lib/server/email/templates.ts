import type { EmailContent } from "./types";

interface TemplateInput {
  name: string;
  url: string;
}

export function verificationEmail({ name, url }: TemplateInput): EmailContent {
  return {
    html: layout({
      action: "Verify email",
      body: "Confirm your email address to finish setting up your Sunday Board account.",
      name,
      url,
    }),
    subject: "Verify your email address",
    text: `Hi ${name},\n\nConfirm your email address to finish setting up your Sunday Board account:\n\n${url}\n\nIf you didn't create an account, you can ignore this email.`,
  };
}

export function passwordResetEmail({ name, url }: TemplateInput): EmailContent {
  return {
    html: layout({
      action: "Reset password",
      body: "Choose a new password for your Sunday Board account. This link expires in an hour.",
      name,
      url,
    }),
    subject: "Reset your password",
    text: `Hi ${name},\n\nChoose a new password for your Sunday Board account. This link expires in an hour:\n\n${url}\n\nIf you didn't ask to reset your password, you can ignore this email.`,
  };
}

function layout({ action, body, name, url }: TemplateInput & { action: string; body: string }) {
  return `<!doctype html>
<html lang="en">
  <body style="font-family: system-ui, sans-serif; line-height: 1.5;">
    <p>Hi ${escapeHtml(name)},</p>
    <p>${body}</p>
    <p><a href="${escapeHtml(url)}">${action}</a></p>
    <p style="color: #666;">If you weren't expecting this email, you can ignore it.</p>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
