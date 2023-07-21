import { Modal, Textarea, Button, Stack } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import { api } from "~/utils/api";

export function ReportPostModal({
  postId,
  opened,
  onClose,
}: {
  postId: string;
  opened: boolean;
  onClose: () => void;
}) {
  const reportPostMutation = api.post.report.useMutation();
  const form = useForm({
    validate: zodResolver(
      z.object({
        reason: z.string().max(320),
      })
    ),
    initialValues: {
      reason: "",
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Report">
      <form
        onSubmit={form.onSubmit(async (values) => {
          await reportPostMutation.mutateAsync({
            postId: postId,
            reason: values.reason,
          });
          onClose();
        })}
      >
        <Stack spacing={16} sx={{ alignSelf: "flex-start" }}>
          <Textarea
            minRows={3}
            maxRows={8}
            autosize
            maxLength={320}
            {...form.getInputProps("reason")}
          />
          <Button style={{ alignSelf: "flex-start" }} type="submit">
            Submit report
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
