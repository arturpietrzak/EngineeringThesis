import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { Loader } from "~/components/Loader";
import { TextEditor } from "~/components/TextEditor";
import { api } from "~/utils/api";

interface EditTemplatePropsType {
  templateId: string;
}

export default function EditTemplatetPage({
  templateId,
}: EditTemplatePropsType) {
  const { data } = api.template.getTemplateById.useQuery({ id: templateId });
  const updateTemplateMutation = api.template.updateTemplate.useMutation();
  const router = useRouter();

  if (!data) {
    return <Loader />;
  }

  return (
    <>
      <Head>
        <title>Knowhow | Edit {data.template.name}</title>
      </Head>
      <TextEditor
        initialValue={data.template.content}
        isEdit
        onPost={async (content) => {
          await updateTemplateMutation.mutateAsync({ id: templateId, content });
          await router.push("/settings/templates");
        }}
      />
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async ({ query }) => ({
  props: {
    templateId: query.templateId,
  },
});
