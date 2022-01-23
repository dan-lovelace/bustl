import { gql, useMutation } from "@apollo/client";
import { ME_QUERY } from "../queries/appUser";

export function useAcceptTermsMutation() {
  const mutation = gql`
    mutation AcceptTerms {
      acceptTerms
    }
  `;

  return useMutation(mutation, {
    update(cache) {
      const meQuery = cache.readQuery({ query: ME_QUERY });

      cache.modify({
        id: cache.identify({ __ref: `AppUser:${meQuery.me.id}` }),
        fields: {
          must_accept_terms: () => false,
        },
      });
    },
  });
}
