import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import { api } from "../utils/api";
import { Button, Flex, Stack, Text, Textarea } from "@mantine/core";

interface CommentInputProps {
  postId: string;
  onSubmit?: () => void;
}

export function CommentInput({ postId, onSubmit }: CommentInputProps) {
  const commentCreateMutation = api.comment.comment.useMutation({
    onSuccess: () => {
      if (onSubmit) {
        onSubmit();
      }
    },
  });

  const form = useForm({
    validate: zodResolver(
      z.object({
        comment: z
          .string()
          .min(3, "Comment must be at least 3 characters long!")
          .max(320),
      })
    ),
    initialValues: {
      comment: "",
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        commentCreateMutation.mutate({
          postId: postId,
          content: values.comment,
        });
        form.reset();
      })}
    >
      <Stack>
        <Textarea
          withAsterisk
          placeholder="Leave a comment..."
          maxLength={320}
          minRows={3}
          autosize
          {...form.getInputProps("comment")}
        />
        <Flex justify="space-between" align="flex-start">
          <Button type="submit">Submit</Button>
          <Text inline size="sm">
            {form.values.comment.length} / 320 characters
          </Text>
        </Flex>
      </Stack>
    </form>
  );
}
