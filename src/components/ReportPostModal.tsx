import { Modal, Textarea, Button, Stack, Radio } from "@mantine/core";
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
      category: "other",
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Report" size="lg">
      <form
        onSubmit={form.onSubmit(async (values) => {
          await reportPostMutation.mutateAsync({
            postId: postId,
            reason: values.reason,
            category: values.category,
          });
          onClose();
        })}
      >
        <Stack spacing={16} sx={{ alignSelf: "flex-start" }}>
          <Radio.Group
            name="category"
            label="Select the reason of a report"
            withAsterisk
            {...form.getInputProps("category")}
          >
            <Stack mt={8}>
              <Radio value="spam" label="Spam" />
              <Radio value="nudity" label="Nudity" />
              <Radio value="hate_speech" label="Hate speech" />
              <Radio value="scam" label="Scam or fraud" />
              <Radio value="fake_news" label="Fake news or misinformation" />
              <Radio value="other" label="Other" />
            </Stack>
          </Radio.Group>
          <Textarea
            minRows={3}
            maxRows={8}
            autosize
            maxLength={320}
            placeholder="Give any additional context"
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
