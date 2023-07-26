import Head from "next/head";
import { api } from "~/utils/api";
import { Loader } from "~/components/Loader";
import InfiniteScrollTrigger from "~/components/InfiniteScrollTrigger";
import { NavLink, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { PostList } from "~/components/PostList";

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
        <TrendingHashtags
          trendingHashtags={trendingData.pages[0]?.trendingHashtags ?? []}
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

interface TrendingHashtagsProps {
  trendingHashtags: {
    hashtagName: string;
    posts: number;
  }[];
}

function TrendingHashtags({ trendingHashtags }: TrendingHashtagsProps) {
  return (
    <Stack
      sx={(t) => ({
        backgroundColor: t.colorScheme === "dark" ? t.colors.dark[6] : t.white,
        borderRadius: t.radius.sm,
        border: `0.0625rem solid ${
          t.colorScheme === "dark" ? t.colors.dark[4] : t.colors.gray[4]
        }`,
      })}
      spacing="sm"
    >
      <Text size="xl" p={16} pb={0}>
        Currently trending topics:
      </Text>

      {trendingHashtags.length ? (
        trendingHashtags.map((h) => (
          <NavLink
            label={
              <Stack spacing={0}>
                <Text size="lg">{`#${h.hashtagName}`}</Text>
                <Text c="dimmed">{h.posts} posts last week</Text>
              </Stack>
            }
            component={Link}
            href={`/hashtag/${h.hashtagName}`}
            key={h.hashtagName}
            sx={(theme) => ({
              display: "block",
              width: "100%",
              padding: theme.spacing.md,
              color:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[0]
                  : theme.black,

              "&:hover": {
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[7]
                    : theme.colors.gray[0],
              },
            })}
          />
        ))
      ) : (
        <NavLink
          label={
            <Stack spacing={0}>
              <Text size="lg">No trending topics</Text>
            </Stack>
          }
          component={Link}
          disabled
          href=""
          sx={(theme) => ({
            display: "block",
            width: "100%",
            padding: theme.spacing.md,
            color:
              theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

            "&:hover": {
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[7]
                  : theme.colors.gray[0],
            },
          })}
        />
      )}
    </Stack>
  );
}
