import { gql, useQuery } from "@apollo/client";

import { appUserFragment, subscriptionFragment } from "../fragments";

export function useAccountPageQuery(args = {}) {
  const query = gql`
    query AccountPage {
      me {
        ...AppUser
        subscription {
          ...Subscription
        }
      }
    }
    ${appUserFragment}
    ${subscriptionFragment}
  `;

  return useQuery(query, args);
}

export const ME_QUERY = gql`
  query Me {
    me {
      ...AppUser
    }
  }
  ${appUserFragment}
`;

export function useMeQuery(args = {}) {
  return useQuery(ME_QUERY, args);
}

export const SUBSCRIPTION_USAGE_QUERY = gql`
  query UsageData {
    me {
      subscription {
        usage {
          board_create_monthly {
            current
            flag {
              description
              key
              value
            }
          }
          board_create_total_active {
            current
            flag {
              description
              key
              value
            }
          }
          image_upload_request_monthly {
            current
            flag {
              description
              key
              value
            }
          }
        }
      }
    }
  }
`;

export function useSubscriptionUsageQuery(args = {}) {
  return useQuery(SUBSCRIPTION_USAGE_QUERY, args);
}
