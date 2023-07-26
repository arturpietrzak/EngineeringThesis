import { Stack } from "@mantine/core";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useState } from "react";
import { CommentInput } from "~/components/CommentInput";
import { CommentList } from "~/components/CommentList";
import { Loader } from "~/components/Loader";
import { Post } from "~/components/Post";
import { api } from "~/utils/api";

interface PostPagePropsType {
  postId: string;
}

export default function PostPage({ postId }: PostPagePropsType) {
  const { data: postData, refetch } = api.post.getById.useQuery(
    { id: postId },
    {
      onSuccess(data) {
        setIsLiked(data.post.liked);
      },
    }
  );
  const likePostMutation = api.post.like.useMutation();
  const unlikePostMutation = api.post.unlike.useMutation();
  const [isLiked, setIsLiked] = useState<boolean>(false);

  if (!postData) {
    return <Loader />;
  }

  return (
    <>
      <Head>
        <title>Grumbler | {postData.post.displayName}&apos;s post</title>
      </Head>
      <Stack spacing={16}>
        <Post
          {...postData.post}
          onLikeClick={function (): void {
            if (!postData.post.likeButtonActive) {
              return;
            }

            if (isLiked) {
              unlikePostMutation.mutate({ postId: postId });
            } else {
              likePostMutation.mutate({ postId: postId });
            }

            setIsLiked((prev) => !prev);
          }}
          likesCount={
            postData.post.likesCount -
            Number(postData.post.liked) +
            Number(isLiked)
          }
          liked={isLiked}
        />
        <CommentInput postId={postId} onSubmit={refetch} />
        {postData.comments && (
          <CommentList comments={postData.comments} refetch={refetch} />
        )}
      </Stack>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async ({ query }) => ({
  props: {
    postId: query.postId,
  },
});
