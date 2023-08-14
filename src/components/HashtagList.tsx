import { Stack, NavLink, Text } from "@mantine/core";
import Link from "next/link";

interface HashtagListProps {
  hashtags: {
    hashtagName: string;
    posts: number;
  }[];
  trending?: boolean;
}

export function HashtagList({ hashtags, trending }: HashtagListProps) {
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
      {trending && (
        <Text size="xl" p={16} pb={0}>
          Currently trending topics:
        </Text>
      )}
      {hashtags.length ? (
        hashtags.map((h) => (
          <NavLink
            label={
              <Stack spacing={0}>
                <Text size="lg">{`#${h.hashtagName}`}</Text>
                <Text c="dimmed">
                  {h.posts} post{h.posts > 1 && "s"} {trending && "last week"}
                </Text>
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
              <Text size="lg">
                {trending ? "No trending topics" : "No topics"}
              </Text>
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
