import { Flex, Group, useMantineTheme, Text, Stack } from "@mantine/core";
import {
  IconEdit,
  IconFlag,
  IconHeart,
  IconMessageCircle,
  IconX,
} from "@tabler/icons-react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "next/image";
import Link from "next/link";
import { Link as TiptapLink } from "@tiptap/extension-link";
import { lowlight } from "lowlight";
import { Image as TiptapImage } from "@tiptap/extension-image";
import { useDisclosure } from "@mantine/hooks";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";
import { RichTextEditor } from "@mantine/tiptap";
import { useSession } from "next-auth/react";
import { ReportPostModal } from "./ReportPostModal";

interface PostListProps {
  posts: Omit<PostProps, "onReportClick" | "onLikeClick" | "onRemoveClick">[];
  refetch: () => void;
}

export function PostList({ posts, refetch }: PostListProps) {
  const [reportedPostId, setReportedPostId] = useState("");
  const [
    reportModalOpened,
    { open: openReportModal, close: closeReportModal },
  ] = useDisclosure(false);

  const { mutateAsync: deletePostMutation } = api.post.delete.useMutation();

  const { data } = useSession();

  if (posts.length) {
    return (
      <Stack>
        <ReportPostModal
          onClose={() => {
            closeReportModal();
            setReportedPostId("");
            refetch();
          }}
          opened={reportModalOpened}
          postId={reportedPostId}
        />
        {posts.map((p) => (
          <Post
            key={p.id}
            {...p}
            onReportClick={() => {
              setReportedPostId(p.id);
              openReportModal();
            }}
            onRemoveClick={() => {
              void deletePostMutation({ postId: p.id }).then(() => {
                refetch();
              });
            }}
          />
        ))}
      </Stack>
    );
  } else {
    return <Text align="center">No posts</Text>;
  }
}

interface PostProps {
  id: string;
  userImage: string;
  displayName: string;
  username: string;
  createdAt: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  liked: boolean;
  onRemoveClick: () => void;
  onReportClick: () => void;
}

function Post({
  id,
  userImage,
  displayName,
  username,
  createdAt,
  content,
  likesCount,
  commentsCount,
  liked,
  onRemoveClick,
  onReportClick,
}: PostProps) {
  const theme = useMantineTheme();
  const editor = useEditor({
    editable: false,
    content: content,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({ placeholder: "Write here..." }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TiptapLink.configure({
        openOnClick: true,
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          class: "embed-image",
        },
      }),
    ],
  });

  const likePostMutation = api.post.like.useMutation();
  const unlikePostMutation = api.post.unlike.useMutation();
  const [isLiked, setIsLiked] = useState<boolean>(liked);

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // TODO: Add edit post link
  return (
    <Stack
      sx={(t) => ({
        backgroundColor: t.colorScheme === "dark" ? t.colors.dark[6] : t.white,
        borderRadius: t.radius.sm,
        border: `0.0625rem solid ${
          t.colorScheme === "dark" ? t.colors.dark[4] : t.colors.gray[4]
        }`,
        position: "relative",
      })}
    >
      <Stack p={16} spacing="sm">
        <PostInfoHeader
          userImage={userImage}
          displayName={displayName}
          username={username}
          createdAt={createdAt}
        />
        <RichTextEditor
          editor={editor}
          sx={{
            border: "0",
            ".ProseMirror": {
              padding: "0 !important",
              backgroundColor: "transparent !important",
            },
            ".mantine-RichTextEditor-content": {
              backgroundColor: "transparent ",
              maxHeight: "unset !important",
            },
            pre: {
              background: `${
                theme.colorScheme === "dark"
                  ? theme.colors.dark[7]
                  : theme.colors.gray[1]
              } !important`,
            },
          }}
          withCodeHighlightStyles
        >
          <RichTextEditor.Content />
        </RichTextEditor>
        <PostReactionsFooter
          likesCount={likesCount - Number(liked) + Number(isLiked)}
          commentsCount={commentsCount}
          liked={isLiked}
          onLikeClick={() => {
            if (isLiked) {
              unlikePostMutation.mutate({ postId: id });
            } else {
              likePostMutation.mutate({ postId: id });
            }

            setIsLiked((prev) => !prev);
          }}
          onReportClick={onReportClick}
          onRemoveClick={onRemoveClick}
        />
      </Stack>
      <Link
        href={`/post/${id}`}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
        }}
      />
    </Stack>
  );
}

interface PostInfoHeaderProps {
  userImage: string;
  displayName: string;
  username: string;
  createdAt: string;
}

export function PostInfoHeader({
  userImage,
  displayName,
  username,
  createdAt,
}: PostInfoHeaderProps) {
  return (
    <Flex justify="space-between" align="flex-start" gap="xs">
      <Link href={`/user/${username}`} style={{ zIndex: 1 }}>
        <Flex gap="xs" align="flex-start">
          <Image
            src={userImage}
            alt="User image"
            width={36}
            height={36}
            style={{
              borderRadius: 4,
            }}
          />
          <Stack spacing={0}>
            <Text size="xs" sx={{ overflowWrap: "anywhere" }}>
              {displayName}
            </Text>
            <Text color="dark.2" size="xs" sx={{ overflowWrap: "anywhere" }}>
              @{username}
            </Text>
          </Stack>
        </Flex>
      </Link>
      <Text size="xs" align="end">
        {createdAt}
      </Text>
    </Flex>
  );
}

interface PostReactionsFooterProps {
  likesCount: number;
  commentsCount: number;
  liked: boolean;
  onLikeClick: () => void;
  onReportClick: () => void;
  onEditClick?: () => void;
  onRemoveClick?: () => void;
}

export function PostReactionsFooter({
  likesCount,
  commentsCount,
  liked,
  onLikeClick,
  onReportClick,
  onRemoveClick,
  onEditClick,
}: PostReactionsFooterProps) {
  const theme = useMantineTheme();

  return (
    <Flex justify="space-between">
      <Group spacing="lg">
        <Text
          p={0}
          onClick={(e) => {
            e.preventDefault();
            onLikeClick();
          }}
          sx={{
            cursor: "pointer",
            userSelect: "none",
            zIndex: 1,
          }}
        >
          <Flex justify="space-between" align="center" gap={4}>
            <Text size="xl">{likesCount}</Text>
            <IconHeart
              style={{
                fill: liked ? theme.colors.teal[6] : undefined,
                stroke: liked ? theme.colors.teal[6] : undefined,
              }}
            />
          </Flex>
        </Text>
        <Text
          p={0}
          sx={{
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <Flex justify="space-commentsCount" align="center" gap={4}>
            <Text size="xl">{commentsCount}</Text>
            <IconMessageCircle />
          </Flex>
        </Text>
      </Group>
      <Group>
        {onEditClick && onRemoveClick ? (
          <>
            <Text
              onClick={(e) => {
                e.preventDefault();
                onRemoveClick();
              }}
              sx={{
                cursor: "pointer",
                userSelect: "none",
                zIndex: 1,
              }}
            >
              <IconX />
            </Text>
            <Text
              onClick={(e) => {
                e.preventDefault();
                onEditClick();
              }}
              sx={{
                cursor: "pointer",
                userSelect: "none",
                zIndex: 1,
              }}
            >
              <IconEdit />
            </Text>
          </>
        ) : (
          <Text
            onClick={(e) => {
              e.preventDefault();
              onReportClick();
            }}
            sx={{
              cursor: "pointer",
              userSelect: "none",
              zIndex: 1,
            }}
          >
            <IconFlag />
          </Text>
        )}
      </Group>
    </Flex>
  );
}
