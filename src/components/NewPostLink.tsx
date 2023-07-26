import { Flex, Text } from "@mantine/core";
import { IconFilePencil } from "@tabler/icons-react";
import Link from "next/link";

export function NewPostLink() {
  return (
    <Link href="/new-post">
      <Flex
        justify="center"
        align="center"
        h={156}
        mb={16}
        sx={(t) => ({
          background: `linear-gradient(90deg, ${
            t.colorScheme === "dark" ? t.colors.dark[7] : t.colors.gray[0]
          } 0%, ${
            t.colorScheme === "dark" ? t.colors.blue[9] : t.colors.blue[5]
          } 100%)`,
          borderRadius: t.radius.sm,
          border: `0.0625rem solid ${
            t.colorScheme === "dark" ? t.colors.dark[4] : t.colors.gray[4]
          }`,
          position: "relative",
          overflow: "hidden",
        })}
      >
        <Text fz="xl" fs="italic">
          Write your post{" "}
          <Text component="span" td="underline" fw={700} color="blue">
            here
          </Text>
        </Text>
        <IconFilePencil
          style={{
            position: "absolute",
            right: -60,
            transform: "rotateX(24deg) rotateY(-22deg) rotateZ(20deg)",
            opacity: 0.1,
          }}
          color="white"
          size={256}
        />
      </Flex>
    </Link>
  );
}
