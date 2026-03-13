export type ContactRole = "Doctor" | "Lab";

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  role: ContactRole;
}

export interface ContactResponse {
  message: string;
}
