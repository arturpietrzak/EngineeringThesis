import { Flex, Group, Stack, Text, useMantineTheme } from "@mantine/core";
import { useState } from "react";
import { IconHeart, IconX } from "@tabler/icons-react";
import { api } from "../utils/api";
import { PostInfoHeader } from "./PostList";
import { useSession } from "next-auth/react";

interface CommentListProps {
  refetch: () => void;
  comments: {
    commentId: string;
    content: string;
    createdAt: string;
    userId: string;
    displayName: string;
    username: string;
    userImgUrl: string;
    liked: boolean;
    likeAmount: number;
  }[];
}

export function CommentList({ comments, refetch }: CommentListProps) {
  const likeCommentMutation = api.comment.likeComment.useMutation();
  const unlikeCommentMutation = api.comment.unlikeComment.useMutation();
  const deleteCommentMutation = api.comment.deleteComment.useMutation();

  const { data } = useSession();

  return (
    <Stack>
      {comments.map(
        ({
          username,
          displayName,
          liked,
          userImgUrl,
          createdAt,
          content,
          commentId,
          likeAmount,
        }) => (
          <Comment
            userImgUrl={userImgUrl}
            content={content}
            username={username}
            displayName={displayName}
            createdAt={createdAt}
            liked={liked}
            commentId={commentId}
            likeAmount={likeAmount}
            key={commentId}
            onLikeClick={() => likeCommentMutation.mutate({ commentId })}
            onUnlikeClick={() => unlikeCommentMutation.mutate({ commentId })}
            onDeleteClick={
              data?.user.username === username
                ? async () => {
                    await deleteCommentMutation.mutateAsync({ commentId });
                    refetch();
                  }
                : undefined
            }
          />
        )
      )}
    </Stack>
  );
}

interface CommentProps {
  userImgUrl: string;
  content: string;
  commentId: string;
  username: string;
  displayName: string;
  createdAt: string;
  liked: boolean;
  likeAmount: number;
  onLikeClick: () => void;
  onUnlikeClick: () => void;
  onDeleteClick?: () => void;
}

function Comment({
  userImgUrl,
  content,
  username,
  displayName,
  createdAt,
  liked,
  likeAmount,
  onUnlikeClick,
  onLikeClick,
  onDeleteClick,
}: CommentProps) {
  const [isLiked, setIsLiked] = useState<boolean>(liked);
  const theme = useMantineTheme();

  return (
    <Stack
      sx={(t) => ({
        backgroundColor: t.colorScheme === "dark" ? t.colors.dark[6] : t.white,
        borderRadius: t.radius.sm,
        border: `0.0625rem solid ${
          t.colorScheme === "dark" ? t.colors.dark[4] : t.colors.gray[4]
        }`,
      })}
      p={16}
    >
      <PostInfoHeader
        userImage={userImgUrl}
        displayName={displayName}
        username={username}
        createdAt={createdAt}
      />
      <Text size="lg">{content}</Text>
      <Text p={0}>
        <Flex justify="space-between" align="center">
          <Group
            spacing={4}
            onClick={() => {
              if (isLiked) {
                onUnlikeClick();
              } else {
                onLikeClick();
              }
              setIsLiked((prev) => !prev);
            }}
            sx={{
              cursor: "pointer",
              userSelect: "none",
              zIndex: 1,
            }}
          >
            <Text size="xl">
              {likeAmount - Number(liked) + Number(isLiked)}
            </Text>
            <IconHeart
              style={{
                fill: isLiked ? theme.colors.blue[6] : undefined,
                stroke: isLiked ? theme.colors.blue[6] : undefined,
              }}
            />
          </Group>
          {onDeleteClick && (
            <Text
              onClick={(e) => {
                e.preventDefault();
                onDeleteClick();
              }}
              sx={{
                cursor: "pointer",
                userSelect: "none",
                zIndex: 1,
              }}
            >
              <IconX />
            </Text>
          )}
        </Flex>
      </Text>
    </Stack>
  );
}
