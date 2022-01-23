import { useMeQuery } from "lib/gql/queries/appUser";

export default function MeProvider({ children }) {
  const { data, error, loading } = useMeQuery();

  if (loading) return false;
  if (error) return `Error getting me: ${error.toString()}`;
  if (!data || !data.me) return "Cannot find you";

  return children({ me: data.me });
}
