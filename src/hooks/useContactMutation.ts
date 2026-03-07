import { useMutation } from "@tanstack/react-query";
import { contactService } from "@/services/contact.service";
import { ContactPayload } from "@/types/contact.types";

const IS_DEV = import.meta.env.DEV;

const debugLog = (tag: string, payload: unknown) => {
  if (!IS_DEV) return;
  console.log(tag, payload);
};

const debugError = (tag: string, payload: unknown) => {
  if (!IS_DEV) return;
  console.error(tag, payload);
};

export const useContactMutation = () => {
  return useMutation({
    mutationFn: (payload: ContactPayload) => {
      debugLog("[MUTATION START]", { mutationName: "contact.submit" });
      return contactService.submit(payload);
    },
    onSuccess: (data) => {
      debugLog("[MUTATION SUCCESS]", { mutationName: "contact.submit", data });
    },
    onError: (error) => {
      debugError("[MUTATION ERROR]", { mutationName: "contact.submit", error });
    },
  });
};
