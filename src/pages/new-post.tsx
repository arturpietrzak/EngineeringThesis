import { Select, Stack } from "@mantine/core";
import Head from "next/head";
import { TextEditor } from "~/components/TextEditor";
import { api } from "~/utils/api";

export default function NewPostPage() {
  const postCreateMutation = api.post.create.useMutation();

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
            void (async () => {
              await postCreateMutation.mutateAsync({
                content: content,
              });
            })();
          }}
        />
      </Stack>
    </>
  );
}
