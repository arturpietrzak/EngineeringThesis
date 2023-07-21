import { Anchor, Select, Stack, Text } from "@mantine/core";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useState } from "react";
import InfiniteScrollTrigger from "~/components/InfiniteScrollTrigger";
import { Loader } from "~/components/Loader";
import { PostList } from "~/components/PostList";
import { api } from "~/utils/api";

interface HashtagPagePropsType {
  hashtag: string;
}

export default function HashtagPage({ hashtag }: HashtagPagePropsType) {
  const [allPosts, setAllPosts] = useState(false);
  const {
    data: trendingData,
    fetchNextPage,
    isFetching,
    refetch,
  } = api.post.getByHashtag.useInfiniteQuery(
    { hashtagName: hashtag, allPosts },
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
    }
  );

  return (
    <>
      <Head>
        <title>Grumbler | #{hashtag}</title>
      </Head>
      <Stack spacing={48}>
        <HashtagInfo hashtagName={hashtag} onShowAllChange={setAllPosts} />
        {trendingData ? (
          <PostList
            refetch={refetch}
            posts={trendingData.pages.map((p) => p.posts).flat(1)}
          />
        ) : (
          <Loader />
        )}
      </Stack>
      {trendingData && (
        <InfiniteScrollTrigger
          isFetching={isFetching}
          onScreenEnter={fetchNextPage}
        />
      )}
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async ({ query }) => ({
  props: {
    hashtag: query.hashtag,
  },
});

interface HashtagInfoProps {
  hashtagName: string;
  onShowAllChange: (showAll: boolean) => void;
}

function HashtagInfo({ hashtagName, onShowAllChange }: HashtagInfoProps) {
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
      p={16}
    >
      <Text size="xl">
        Top posts in{" "}
        <Anchor
          component="span"
          sx={{ cursor: "auto", ":hover": { textDecoration: "none" } }}
        >
          #{hashtagName}
        </Anchor>
      </Text>
      <Select
        defaultValue="recent"
        data={[
          { value: "recent", label: "Show recent posts" },
          { value: "all", label: "Show all posts" },
        ]}
        onChange={(value) => {
          onShowAllChange(value === "all");
        }}
        styles={() => ({
          input: {
            borderWidth: 2,
          },
        })}
      />
    </Stack>
  );
}
