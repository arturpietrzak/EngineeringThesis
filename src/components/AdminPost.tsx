import { useMantineTheme } from "@mantine/core";
import { RichTextEditor } from "@mantine/tiptap";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { lowlight } from "lowlight";
import Image from "@tiptap/extension-image";
import { Link as TipTapLink } from "@tiptap/extension-link";

export function AdminPost({ content }: { content: string }) {
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

  return (
    <>
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
    </>
  );
}
