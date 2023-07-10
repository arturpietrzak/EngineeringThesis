import { useEditor } from "@tiptap/react";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { RichTextEditor } from "@mantine/tiptap";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { lowlight } from "lowlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "@mantine/core";

export function TextEditor({ onPost }: { onPost: (content: string) => void }) {
  const editor = useEditor({
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
      Link.configure({
        openOnClick: true,
      }),
      Image.configure({}),
    ],
    editorProps: {
      handleDrop: function (view, event, slice, moved) {
        if (
          !moved &&
          event.dataTransfer &&
          event.dataTransfer.files &&
          event.dataTransfer.files[0]
        ) {
          const file = event.dataTransfer.files[0]; // the dropped file
          const filesize = file.size / 1024 / 1024;

          if (
            (file.type === "image/jpeg" || file.type === "image/png") &&
            filesize < 3
          ) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "post-pic");
            // const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;dqzzbgxcy
            const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/dqzzbgxcy/image/upload`;

            fetch(CLOUDINARY_URL, {
              method: "POST",
              body: formData,
            })
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .then(async (res: any) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
                const { url } = await res.json();

                const { schema } = view.state;
                const coordinates = view.posAtCoords({
                  left: event.clientX,
                  top: event.clientY,
                });
                if (schema.nodes.image) {
                  const node = schema.nodes.image.create({
                    src: url as string,
                  }); // creates the image element
                  const transaction = view.state.tr.insert(
                    coordinates?.pos ?? 0,
                    node
                  ); // places it in the correct position
                  return view.dispatch(transaction);
                }
              })
              .finally(() => {
                console.log("elo");
              });
          } else {
            window.alert(
              "Images need to be in jpg or png format and less than 10mb in size."
            );
          }

          return true;
        }

        return false;
      },
    },

    content: `
    <p>Hello World!</p>
    <img src="https://source.unsplash.com/8xznAGy4HcY/800x400" />
  `,
  });

  return (
    <>
      <RichTextEditor editor={editor} withCodeHighlightStyles>
        <RichTextEditor.Toolbar sticky stickyOffset={0}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Code />
            <RichTextEditor.CodeBlock />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignJustify />
            <RichTextEditor.AlignRight />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor>
      <Button
        onClick={() => {
          onPost(editor?.getHTML() ?? "");
        }}
        style={{ alignSelf: "flex-end" }}
      >
        Post
      </Button>
    </>
  );
}
