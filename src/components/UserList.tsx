import { Stack, NavLink, Text, Flex, Group } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

interface UserListProps {
  users: {
    username: string;
    displayName: string;
    imageUrl: string;
    followers: number;
    posts: number;
  }[];
}

export function UserList({ users }: UserListProps) {
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
      {users.length ? (
        users.map((u) => (
          <NavLink
            label={
              <Flex gap="xs" align="center" justify="space-between">
                <Group>
                  <Image
                    src={u.imageUrl}
                    alt="User image"
                    width={36}
                    height={36}
                    style={{
                      borderRadius: 4,
                    }}
                  />
                  <Stack spacing={0}>
                    <Text sx={{ overflowWrap: "anywhere" }}>
                      {u.displayName}
                    </Text>
                    <Text color="dark.2" sx={{ overflowWrap: "anywhere" }}>
                      @{u.username}
                    </Text>
                  </Stack>
                </Group>
                <Group>
                  <Text c="dimmed">
                    Followers: <Text component="span">{u.followers}</Text>
                  </Text>
                  <Text c="dimmed">
                    Posts: <Text component="span">{u.posts}</Text>
                  </Text>
                </Group>
              </Flex>
            }
            component={Link}
            href={`/user/${u.username}`}
            key={u.username}
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
              <Text size="lg">No users</Text>
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
