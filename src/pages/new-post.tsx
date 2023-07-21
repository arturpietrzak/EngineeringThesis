import { Select, Stack } from "@mantine/core";
import Head from "next/head";
import { useRouter } from "next/router";
import { TextEditor } from "~/components/TextEditor";
import { api } from "~/utils/api";

export default function NewPostPage() {
  const postCreateMutation = api.post.create.useMutation();
  const router = useRouter();

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
