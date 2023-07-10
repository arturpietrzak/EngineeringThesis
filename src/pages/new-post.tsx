import { Button, Select, Stack } from "@mantine/core";
import Head from "next/head";
import { TextEditor } from "~/components/TextEditor";

export default function NewPost() {
  return (
    <>
      <Head>
        <title>Knowhow | Create new post</title>
      </Head>
      <Stack spacing={16}>
        <Select
          label="Template"
          placeholder="Start with..."
          searchable
          nothingFound="No templates"
          data={["Scientific", "Essay", "Discussion"]}
        />
        <TextEditor
          onPost={(content) => {
            console.log(content);
          }}
        />
      </Stack>
    </>
  );
}
