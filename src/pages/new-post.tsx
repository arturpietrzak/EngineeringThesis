import { Select, Stack } from "@mantine/core";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { TextEditor } from "~/components/TextEditor";
import { api } from "~/utils/api";

export default function NewPostPage() {
  const postCreateMutation = api.post.create.useMutation();
  const { data } = api.template.getTemplates.useQuery({});
  const router = useRouter();
  const [initialValue, setInitialValue] = useState("");

  console.log(initialValue);

  return (
    <>
      <Head>
        <title>Knowhow | Create new post</title>
      </Head>
      <Stack spacing={16}>
        <Select
          clearable
          label="Template"
          placeholder="Start with..."
          nothingFound="No templates"
          data={
            data?.templates.map(({ id, name, group }) => ({
              value: id,
              label: name,
              group,
            })) ?? []
          }
          onChange={(value) => {
            setInitialValue(
              data?.templates.find((t) => t.id === value)?.content ?? ""
            );
          }}
          styles={{ item: { textTransform: "capitalize" } }}
        />
        <TextEditor
          initialValue={initialValue}
          onPost={async (content, hashtags) => {
            const { postId } = await postCreateMutation.mutateAsync({
              content: content,
              hashtags: hashtags,
            });
            void router.push(`/post/${postId}`);
          }}
        />
      </Stack>
    </>
  );
}
