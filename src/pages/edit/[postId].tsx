import { Stack } from "@mantine/core";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { CommentInput } from "~/components/CommentInput";
import { CommentList } from "~/components/CommentList";
import { Loader } from "~/components/Loader";
import { Post } from "~/components/Post";
import { TextEditor } from "~/components/TextEditor";
import { api } from "~/utils/api";

interface EditPagePropsType {
  postId: string;
}

export default function PostPage({ postId }: EditPagePropsType) {
  const { data: postData, refetch } = api.post.getByIdToUpdate.useQuery({
    id: postId,
  });

  const updatePostMutation = api.post.update.useMutation();
  const router = useRouter();

  if (!postData) {
    return <Loader />;
  }

  return (
    <>
      <Head>
        <title>Knowhow | Edit post</title>
      </Head>
      <Stack spacing={16}>
        <TextEditor
          initialValue={postData.post.content}
          isEdit
          onPost={async (content) => {
            await updatePostMutation.mutateAsync({ postId, content });
            void router.push(`/post/${postId}`);
          }}
        />
      </Stack>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return {
    props: {
      postId: query.postId,
    },
  };
};
