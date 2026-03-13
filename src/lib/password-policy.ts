export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters and include numbers and special characters";

export const PASSWORD_CONFIRM_REQUIRED_MESSAGE = "Confirm password is required";
export const PASSWORDS_DO_NOT_MATCH_MESSAGE = "Passwords do not match";

const NUMBER_REGEX = /\d/;
const SPECIAL_CHARACTER_REGEX = /[^A-Za-z0-9]/;

export const isPasswordPolicyValid = (password: string) =>
  password.length >= 8 &&
  NUMBER_REGEX.test(password) &&
  SPECIAL_CHARACTER_REGEX.test(password);

export const validatePasswordPolicy = (password: string) =>
  isPasswordPolicyValid(password) ? undefined : PASSWORD_POLICY_MESSAGE;

export const passwordsMatch = (password: string, confirmPassword: string) =>
  password === confirmPassword;
