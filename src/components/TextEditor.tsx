import { RichTextEditor } from "@mantine/rte";
import { lowlight } from "lowlight";
import { Button } from "@mantine/core";
import { useState } from "react";

export function TextEditor({ onPost }: { onPost: (content: string) => void }) {
  const [value, onChange] = useState("");

  return (
    <>
      <RichTextEditor
        value={value}
        onChange={onChange}
        controls={[
          ["bold", "italic", "underline", "strike", "clean"],
          ["h1", "h2", "h3", "h4"],
          ["sup", "sub"],
          ["link", "image", "video", "blockquote", "code", "codeBlock"],
          ["alignLeft", "alignCenter", "alignRight"],
        ]}
      />
      <Button
        onClick={() => {
          onPost(value);
        }}
        style={{ alignSelf: "flex-end" }}
      >
        Post
      </Button>
    </>
  );
}
