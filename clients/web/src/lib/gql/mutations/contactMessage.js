import { gql, useMutation } from "@apollo/client";
import { contactMessageFragment } from "../fragments";

export function useCreateContactMessageMutation() {
  const mutation = gql`
    mutation CreateContactMessage($input: CreateContactMessageInput!) {
      createContactMessage(input: $input) {
        ...ContactMessage
      }
    }
    ${contactMessageFragment}
  `;

  return useMutation(mutation, {
    update(cache, { data: { createContactMessage: newContactMessage } }) {
      cache.modify({
        fields: {
          contactMessages(existingContactMessages = []) {
            const newContactMessageRef = cache.writeFragment({
              data: newContactMessage,
              fragment: contactMessageFragment,
            });

            return [newContactMessageRef, ...existingContactMessages];
          },
        },
      });
    },
  });
}
