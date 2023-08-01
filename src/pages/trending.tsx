import Head from "next/head";
import { api } from "~/utils/api";
import { Loader } from "~/components/Loader";
import InfiniteScrollTrigger from "~/components/InfiniteScrollTrigger";
import { Stack } from "@mantine/core";
import { PostList } from "~/components/PostList";
import { HashtagList } from "~/components/HashtagList";

export default function TrendingPage() {
  const {
    data: trendingData,
    fetchNextPage,
    isFetching,
    refetch,
  } = api.post.getTrending.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
    }
  );

  if (!trendingData) {
    return <Loader />;
  }

  return (
    <>
      <Head>
        <title>Grumbler | Trending</title>
      </Head>
      <Stack spacing={16}>
        <HashtagList
          trending
          hashtags={trendingData.pages[0]?.trendingHashtags ?? []}
        />
        <PostList
          refetch={refetch}
          posts={trendingData.pages.map((p) => p.posts).flat(1)}
        />
      </Stack>
      <InfiniteScrollTrigger
        isFetching={isFetching}
        onScreenEnter={fetchNextPage}
      />
    </>
  );
}
