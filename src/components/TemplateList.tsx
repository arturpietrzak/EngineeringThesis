import { Button, Flex, Group, NavLink, Stack, Text } from "@mantine/core";
import { IconEdit, IconTrashX } from "@tabler/icons-react";
import Link from "next/link";

export function TemplateList({
  templates,
  onDelete,
}: {
  templates: { name: string; id: string }[];
  onDelete: (id: string) => void;
}) {
  return templates.length ? (
    <>
      <Stack
        spacing={0}
        sx={(t) => ({
          backgroundColor:
            t.colorScheme === "dark" ? t.colors.dark[6] : t.white,
          borderRadius: t.radius.sm,
          border: `0.0625rem solid ${
            t.colorScheme === "dark" ? t.colors.dark[4] : t.colors.gray[4]
          }`,
        })}
      >
        {templates.map(({ name, id }) => (
          <NavLink
            label={
              <Flex align="center" justify="space-between">
                <Text size="lg" tt="capitalize">
                  {name}
                </Text>
                <Group>
                  <Button
                    component={Link}
                    href={`/edit-template/${id}`}
                    w={40}
                    h={40}
                    p={0}
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(id);
                    }}
                  >
                    <IconEdit />
                  </Button>
                  <Button
                    w={40}
                    h={40}
                    p={0}
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(id);
                    }}
                  >
                    <IconTrashX />
                  </Button>
                </Group>
              </Flex>
            }
            key={id}
            sx={(theme) => ({
              cursor: "default",
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
        ))}
      </Stack>
      <Flex justify="flex-end" align="center">
        <Text c={templates.length >= 25 ? "yellow" : "dimmed"}>
          {templates.length}/25 templates
        </Text>
      </Flex>
    </>
  ) : (
    <Flex justify="center" align="center">
      You have no templates
    </Flex>
  );
}
