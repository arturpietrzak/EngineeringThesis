import { Flex, Loader as MantineLoader } from "@mantine/core";

export function Loader() {
  return (
    <Flex
      h="calc(100vh - 32px)"
      justify="center"
      align="center"
      sx={{ boxSizing: "border-box" }}
    >
      <MantineLoader size={64} />
    </Flex>
  );
}
