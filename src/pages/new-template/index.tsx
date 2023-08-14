import { Stack, TextInput } from "@mantine/core";
import Head from "next/head";
import { useRouter } from "next/router";
import { TextEditor } from "~/components/TextEditor";
import { api } from "~/utils/api";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";

const schema = z.object({
  name: z
    .string()
    .min(3, "Use from 3 to 32 characters.")
    .max(32, "Use from 3 to 32 characters."),
});

export default function NewTemplatetPage() {
  const createTemplateMutation = api.template.createTemplate.useMutation();
  const router = useRouter();
  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      name: "",
    },
  });

  return (
    <>
      <Head>
        <title>Knowhow | New template</title>
      </Head>
      <Stack spacing={16}>
        <TextInput
          placeholder="Template name..."
          {...form.getInputProps("name")}
        />
        <TextEditor
          isEdit
          onPost={async (content) => {
            form.validate();
            if (form.isValid()) {
              await createTemplateMutation.mutateAsync({
                content,
                name: form.values.name,
              });
              await router.push("/settings/templates");
            }
          }}
        />
      </Stack>
    </>
  );
}
