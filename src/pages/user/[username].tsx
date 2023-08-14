import type { GetServerSideProps } from "next";
import Head from "next/head";
import { api } from "../../utils/api";
import { Loader } from "../../components/Loader";
import InfiniteScrollTrigger from "../../components/InfiniteScrollTrigger";
import { Button, Flex, MediaQuery, Stack, Text } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { IconSettings } from "@tabler/icons-react";
import { PostList } from "~/components/PostList";

interface UserPagePropsType {
  username: string;
}

export default function UserPage({ username }: UserPagePropsType) {
  const {
    data: userData,
    refetch,
    isFetching,
    fetchNextPage,
  } = api.user.getUser.useInfiniteQuery(
    {
      username,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const { mutateAsync: followMutationAsync } = api.user.follow.useMutation();
  const { mutateAsync: unfollowMutationAsync } =
    api.user.unfollow.useMutation();

  if (!userData) {
    return <Loader />;
  }

  return (
    <>
      <Head>
        <title>Knowhow | {userData.pages[0]?.user.displayName}</title>
      </Head>
      <Stack spacing={16}>
        <UserHeader
          // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
          {...userData.pages[0]!.user}
          onFollowClick={async () => {
            if (userData.pages[0]?.user.isUserFollowing) {
              await unfollowMutationAsync({ username });
            } else {
              await followMutationAsync({ username });
            }

            void refetch();
          }}
        />
        <PostList
          refetch={refetch}
          posts={userData.pages.map((p) => p.posts).flat(1)}
        />
      </Stack>
      <InfiniteScrollTrigger
        isFetching={isFetching}
        onScreenEnter={fetchNextPage}
      />
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async ({ query }) => ({
  props: {
    username: query.username,
  },
});

interface UserHeaderProps {
  username: string;
  imageUrl: string;
  displayName: string;
  bio?: string;
  joinedAt: string;
  followers: number;
  following: number;
  isUserFollowing: boolean;
  onFollowClick: () => void;
  posts: number;
  isUserOwner: boolean;
}

function UserHeader({
  username,
  imageUrl,
  displayName,
  bio,
  joinedAt,
  followers,
  following,
  posts,
  onFollowClick,
  isUserFollowing,
  isUserOwner,
}: UserHeaderProps) {
  return (
    <Stack
      sx={(t) => ({
        backgroundColor: t.colorScheme === "dark" ? t.colors.dark[6] : t.white,
        borderRadius: t.radius.sm,
        border: `0.0625rem solid ${
          t.colorScheme === "dark" ? t.colors.dark[4] : t.colors.gray[4]
        }`,
        position: "relative",
        overflow: "hidden",
      })}
      spacing="sm"
      p={16}
    >
      <MediaQuery smallerThan="xs" styles={{ flexDirection: "column-reverse" }}>
        <Flex justify="space-between" gap={16}>
          <Stack spacing={16}>
            <Stack spacing={4}>
              <Flex align="center" gap={4}>
                <Text size="xl" inline sx={{ overflowWrap: "anywhere" }}>
                  {displayName}
                </Text>
                {isUserOwner && (
                  <Link href="/settings/general">
                    <Text sx={{ lineHeight: 0 }}>
                      <IconSettings size={24} strokeWidth={2} />
                    </Text>
                  </Link>
                )}
              </Flex>
              <Text c="dimmed" sx={{ overflowWrap: "anywhere" }}>
                @{username}
              </Text>
              <Text c="dimmed">Since {joinedAt}</Text>
            </Stack>
            {!isUserOwner && (
              <Button
                sx={{ alignSelf: "flex-start" }}
                onClick={onFollowClick}
                variant={isUserFollowing ? "filled" : "outline"}
              >
                {isUserFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </Stack>
          <Image
            width={96}
            height={96}
            src={imageUrl}
            alt="User image"
            style={{
              borderRadius: 4,
            }}
          />
        </Flex>
      </MediaQuery>
      {bio && <Text size="lg">{bio}</Text>}
      <MediaQuery smallerThan="xs" styles={{ flexDirection: "column", gap: 4 }}>
        <Flex gap={24}>
          <Text c="dimmed">
            Followers: <Text component="span">{followers}</Text>
          </Text>
          <Text c="dimmed">
            Following: <Text component="span">{following}</Text>
          </Text>
          <Text c="dimmed">
            Posts: <Text component="span">{posts}</Text>
          </Text>
        </Flex>
      </MediaQuery>
    </Stack>
  );
}
