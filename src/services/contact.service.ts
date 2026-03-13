import { apiRequest } from "@/services/api";
import { ContactPayload, ContactResponse } from "@/types/contact.types";

export const contactService = {
  submit(payload: ContactPayload): Promise<ContactResponse> {
    return apiRequest<ContactResponse>("/contact", {
      method: "POST",
      body: payload,
    });
  },
};
