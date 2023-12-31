import { Group, Stack, Text, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Link as TipTapLink } from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { lowlight } from "lowlight";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from "~/utils/api";
import Image from "@tiptap/extension-image";
import { PostInfoHeader, PostReactionsFooter } from "./PostList";
import { RichTextEditor } from "@mantine/tiptap";
import { ReportPostModal } from "./ReportPostModal";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface PostProps {
  id: string;
  imageUrl: string;
  displayName: string;
  username: string;
  createdAt: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  liked: boolean;
  hashtags: string[];
  onLikeClick: () => void;
}

export function Post({
  id,
  imageUrl,
  displayName,
  username,
  createdAt,
  content,
  likesCount,
  commentsCount,
  liked,
  hashtags,
  onLikeClick,
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
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TipTapLink.configure({
        openOnClick: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "embed-image",
        },
      }),
    ],
  });

  const [
    reportModalOpened,
    { open: openReportModal, close: closeReportModal },
  ] = useDisclosure(false);

  const { mutateAsync: deletePostMutation } = api.post.delete.useMutation();

  const router = useRouter();
  const { data } = useSession();

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <Stack
      sx={(t) => ({
        backgroundColor: t.colorScheme === "dark" ? t.colors.dark[6] : t.white,
        borderRadius: t.radius.sm,
        border: `0.0625rem solid ${
          t.colorScheme === "dark" ? t.colors.dark[4] : t.colors.gray[4]
        }`,
      })}
      spacing="sm"
      p={16}
    >
      <ReportPostModal
        postId={id}
        opened={reportModalOpened}
        onClose={closeReportModal}
      />
      <PostInfoHeader
        userImage={imageUrl}
        displayName={displayName}
        username={username}
        createdAt={createdAt}
      />
      <Group>
        {hashtags.length &&
          hashtags.map((h) => (
            <Link
              href={`/hashtag/${h}`}
              key={h}
              style={{ zIndex: 2, display: "inline" }}
            >
              <Text c="blue.5">#{h}</Text>
            </Link>
          ))}
      </Group>
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
        postId={id}
        likesCount={likesCount}
        commentsCount={commentsCount}
        liked={liked}
        onLikeClick={onLikeClick}
        onReportClick={openReportModal}
        onRemoveClick={
          data?.user.username === username
            ? async () => {
                await deletePostMutation({ postId: id });
                void router.push("/");
              }
            : undefined
        }
      />
    </Stack>
  );
}
