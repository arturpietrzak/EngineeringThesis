import { Stack, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Link from "@tiptap/extension-link";
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
      Link.configure({
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

  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);

  const { mutateAsync: deletePostMutation } = api.post.delete.useMutation();

  const router = useRouter();

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
      {/* <ReportPostModal
        postId={id}
        opened={reportModalOpened}
        onClose={closeReportModal}
      /> */}
      <PostInfoHeader
        userImage={imageUrl}
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
        likesCount={likesCount}
        commentsCount={commentsCount}
        liked={liked}
        onLikeClick={onLikeClick}
        onReportClick={openReportModal}
        onEditClick={openEditModal}
        onRemoveClick={async () => {
          await deletePostMutation({ postId: id });
          await router.push("/");
        }}
      />
    </Stack>
  );
}
