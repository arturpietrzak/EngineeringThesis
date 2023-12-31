import { Stack, Text, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import Head from "next/head";
import { useState } from "react";
import { HashtagList } from "~/components/HashtagList";
import { Loader } from "~/components/Loader";
import { PostList } from "~/components/PostList";
import { UserList } from "~/components/UserList";
import { api } from "~/utils/api";

export default function Home() {
  const [value, setValue] = useState("");
  const [debounced] = useDebouncedValue(value, 200);

  const { data, isFetching, refetch } = api.user.search.useQuery({
    phrase: debounced,
  });

  return (
    <>
      <Head>
        <title>Knowhow | Search</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Stack spacing={16}>
        <Stack spacing={8}>
          <Text size="md" c="dimmed">
            Enter the content of a post, or start with &#34;@&#34; to look for a
            user, or else start with &#34;#&#34; to look for a specific topic.
          </Text>
          <TextInput
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
            size="md"
            placeholder="Search"
          />
        </Stack>
        {isFetching && <Loader />}
        {data?.tags && <HashtagList hashtags={data.tags} />}
        {data?.posts && <PostList posts={data.posts} refetch={refetch} />}
        {data?.users && <UserList users={data.users} />}
      </Stack>
    </>
  );
}
