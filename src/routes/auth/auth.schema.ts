import { VERIFICATION_CODE_LENGTH } from "$lib/verification";
import * as v from "valibot";

// User.email. Lowercased to match how Better Auth stores and looks addresses up, so our own
// lookups — `emailIsTaken`, say — agree with its answer.
const emailSchema = v.pipe(
  v.string("Email is required"),
  v.trim(),
  v.toLowerCase(),
  v.email("Please enter a valid email"),
);

const passwordSchema = v.pipe(
  v.string("Password is required"),
  v.minLength(8, "Password must be at least 8 characters"),
  v.maxLength(128, "Password must be at most 128 characters"),
  v.regex(/\d/, "Password must contain at least one number"),
  v.regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
);

export const signInEmailSchema = v.object({
  email: emailSchema,
  password: v.pipe(v.string("Password is required"), v.nonEmpty("Password is required")),
});

export const verifyEmailSchema = v.object({
  code: v.pipe(
    v.string("Enter the code we emailed you"),
    v.trim(),
    v.length(VERIFICATION_CODE_LENGTH, `The code is ${VERIFICATION_CODE_LENGTH} digits`),
    v.digits("The code is digits only"),
  ),
});

export const changeEmailSchema = v.object({
  email: emailSchema,
});

export const signUpEmailSchema = v.object({
  email: emailSchema,
  name: v.pipe(v.string("Name is required"), v.trim(), v.minLength(1, "Name is required")),
  password: passwordSchema,
});
