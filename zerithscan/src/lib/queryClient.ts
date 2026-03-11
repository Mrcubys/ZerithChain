import { QueryClient } from "@tanstack/react-query";
import { apiFetch } from "./api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [path] = queryKey as string[];
        return apiFetch(path);
      },
      staleTime: 5000,
      retry: 1,
    },
  },
});
