import Head from "next/head";
import { useForm, zodResolver } from "@mantine/form";
import {
  Button,
  Flex,
  Group,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { z } from "zod";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { IconPhoto, IconPlus, IconUpload, IconX } from "@tabler/icons-react";
import { Loader } from "~/components/Loader";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { TemplateList } from "~/components/TemplateList";

const schema = z.object({
  displayName: z
    .string()
    .min(
      3,
      "Use from 3 to 32 characters. Do not use two or more consecutive spaces."
    )
    .max(
      32,
      "Use from 3 to 32 characters. Do not use two or more consecutive spaces."
    )
    .regex(
      /^\S+(?: \S+)*$/,
      "Use from 3 to 32 characters. Do not use two or more consecutive spaces."
    ),
  username: z
    .string()
    .min(
      3,
      "Use from 3 to 32 characters. Possible characters are latin letters, dots ( . ) and underscores ( _ )."
    )
    .max(
      32,
      "Use from 3 to 32 characters. Possible characters are latin letters, dots ( . ) and underscores ( _ )."
    )
    .regex(
      /^[a-zA-Z0-9._]+$/,
      "Use from 3 to 32 characters. Possible characters are latin letters, dots ( . ) and underscores ( _ )."
    ),
  bio: z.string().max(320),
});

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ""
}/image/upload`;

export default function SettingsPage() {
  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      displayName: "",
      username: "",
      bio: "",
    },
  });
  const router = useRouter();
  const updateSettingsMutation = api.user.updateSettings.useMutation();
  const {
    data: settingsData,
    isFetching,
    refetch,
  } = api.user.getSettings.useQuery(
    {},
    {
      onSuccess: (data) => {
        form.setValues({
          bio: data.bio ?? "",
          displayName: data.displayName ?? "",
          username: data.username ?? "",
        });
      },
    }
  );
  const deleteTemplateMutation = api.template.deleteTemplate.useMutation();

  if (!settingsData || isFetching) {
    return <Loader />;
  }

  return (
    <>
      <Head>
        <title>Knowhow | Settings</title>
      </Head>
      <Tabs
        defaultValue="general"
        value={router.query.activeTab as string}
        onTabChange={(value) => router.push(`/settings/${value ?? ""}`)}
      >
        <Tabs.List>
          <Tabs.Tab value="general">Gallery</Tabs.Tab>
          <Tabs.Tab value="image">Image</Tabs.Tab>
          <Tabs.Tab value="templates">Templates</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="general" pt="xs">
          <form
            onSubmit={form.onSubmit(async (values) => {
              await updateSettingsMutation.mutateAsync(values);
              router.reload();
            })}
          >
            <Stack>
              <TextInput
                {...form.getInputProps("displayName")}
                label="Display name"
              />
              <TextInput {...form.getInputProps("username")} label="Username" />
              <Textarea
                {...form.getInputProps("bio")}
                placeholder="Tell something about yourself..."
                label="Bio"
                maxLength={320}
                minRows={3}
                autosize
              />
              <Button type="submit" style={{ alignSelf: "flex-start" }}>
                Save changes
              </Button>
            </Stack>
          </form>
        </Tabs.Panel>
        <Tabs.Panel value="image" pt="xs">
          <Text weight="500" style={{ lineHeight: "26px" }}>
            Profile image
          </Text>
          <ProfilePictureUpload />
        </Tabs.Panel>
        <Tabs.Panel value="templates" pt="xs">
          <Stack>
            <Button
              w={40}
              h={40}
              p={0}
              onClick={(e) => {
                e.preventDefault();
                void router.push("/new-template");
              }}
              disabled={settingsData.templates.length >= 25}
            >
              <IconPlus />
            </Button>
            <TemplateList
              templates={settingsData.templates}
              onDelete={async (id) => {
                await deleteTemplateMutation.mutateAsync({ id });
                await refetch();
              }}
            />
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </>
  );
}

function ProfilePictureUpload() {
  const updateProfilePictureMutation =
    api.user.updateProfilePicture.useMutation();
  const theme = useMantineTheme();
  const [isUploading, setIsUploading] = useState(false);

  return (
    <Dropzone
      onDrop={(files) => {
        if (files[0]) {
          setIsUploading(true);
          const formData = new FormData();
          formData.append("file", files[0]);
          formData.append("upload_preset", "profile-pic");

          fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData,
          })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then(async (res: any) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              const { public_id } = await res.json();
              updateProfilePictureMutation.mutate(
                {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  picturePublicId: public_id,
                },
                {
                  onSuccess: () => {
                    notifications.show({
                      message:
                        "Successfully updated the image, refresh the page to view changes",
                    });
                  },
                }
              );
            })
            .catch(() => {
              notifications.show({
                message: "There was and issue with your image",
                color: "red",
              });
            })
            .finally(() => {
              setIsUploading(false);
            });
        }
      }}
      maxSize={1024 ** 2}
      accept={[MIME_TYPES.png, MIME_TYPES.jpeg]}
      loading={isUploading}
    >
      <Group
        position="center"
        spacing="xl"
        style={{ minHeight: 220, pointerEvents: "none" }}
      >
        <Dropzone.Accept>
          <IconUpload color={theme.colors.blue[6]} size="3.2rem" />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX color={theme.colors.red[6]} size="3.2rem" />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <Text size={0}>
            <IconPhoto size="3.2rem" />
          </Text>
        </Dropzone.Idle>
        <div>
          <Text size="xl" inline>
            Drag image here or click to select the file
          </Text>
          <Text size="sm" color="dimmed" inline mt={7}>
            Attach a picture in jpeg, jpg or png format up to 1MB
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}
