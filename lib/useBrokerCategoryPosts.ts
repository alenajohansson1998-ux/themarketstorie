import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useBrokerCategoryPosts() {
  // Fetch posts for the 'brokers' category
  const { data, error, isLoading } = useSWR(
    "/api/cms/posts?category=brokers&status=published&limit=3",
    fetcher
  );
  return {
    posts: data?.data || [],
    isLoading,
    isError: !!error,
  };
}
