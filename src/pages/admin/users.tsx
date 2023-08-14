import {
  Button,
  Checkbox,
  Modal,
  Pagination,
  Select,
  Table,
  Tabs,
  Group,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { IconArrowsSort } from "@tabler/icons-react";
import { Loader } from "../../components/Loader";
import { api } from "../../utils/api";
import Head from "next/head";

export default function UsersPage() {
  const [sortOption, setSortOption] = useState("usr-asc");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUser] = useState("");

  const resetUserMutation = api.admin.resetUserData.useMutation();
  const updateRoleMutation = api.admin.updateRole.useMutation();
  const removeUserMutation = api.admin.removeUser.useMutation();

  const { data: selectedUserData, refetch: refetchSelectedUserData } =
    api.admin.getUserData.useQuery(
      { userId: selectedUserId },
      {
        enabled: false,
      }
    );
  const { data: usersData, refetch: refetchUsersData } =
    api.admin.getUsers.useQuery({
      page: page,
      sortOption,
    });

  useEffect(() => {
    if (selectedUserId) {
      void refetchSelectedUserData();
    }
  }, [selectedUserId, refetchSelectedUserData]);

  const [opened, { open, close }] = useDisclosure(false);
  const resetUserForm = useForm({
    initialValues: {
      resetUsername: false,
      resetDisplayName: false,
      resetBio: false,
      removeAllPosts: false,
      resetPicture: false,
    },
  });
  const roleForm = useForm();

  const handleFormClose = () => {
    close();
    resetUserForm.reset();
    roleForm.reset();
    setSelectedUser("");
  };

  const handleSortCLick = (newSortOption: string) => {
    if (newSortOption === sortOption.substring(0, 3)) {
      if (sortOption.substring(4, 7) === "asc") {
        setSortOption(newSortOption + "-des");
      } else {
        setSortOption(newSortOption + "-asc");
      }
    } else {
      setSortOption(newSortOption + "-asc");
    }
  };

  if (!usersData) {
    return <Loader />;
  }

  return (
    <>
      <Head>
        <title>Knowhow | Manage users</title>
      </Head>
      <Modal opened={opened} onClose={handleFormClose} title="Manage" size="lg">
        <Tabs defaultValue="reset">
          <Tabs.List>
            <Tabs.Tab value="reset">Reset user data</Tabs.Tab>
            <Tabs.Tab value="role">Change role</Tabs.Tab>
            <Tabs.Tab value="remove" color="red">
              Remove user
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="reset" pt="md">
            <form
              onSubmit={resetUserForm.onSubmit(async (values) => {
                await resetUserMutation.mutateAsync({
                  ...values,
                  userId: selectedUserId,
                });
                void refetchUsersData();
                handleFormClose();
              })}
            >
              <Checkbox
                label="Username"
                {...resetUserForm.getInputProps("resetUsername", {
                  type: "checkbox",
                })}
              />
              <Checkbox
                label="Display nme"
                {...resetUserForm.getInputProps("resetDisplayName", {
                  type: "checkbox",
                })}
              />
              <Checkbox
                label="Bio"
                {...resetUserForm.getInputProps("resetBio", {
                  type: "checkbox",
                })}
              />
              <Checkbox
                label="Profile picture"
                {...resetUserForm.getInputProps("resetPicture", {
                  type: "checkbox",
                })}
              />
              <Checkbox
                color="red"
                label="Remove all posts"
                {...resetUserForm.getInputProps("removeAllPosts", {
                  type: "checkbox",
                })}
              />
              <Button
                type="submit"
                mt={8}
                color={resetUserForm.values.removeAllPosts ? "red" : undefined}
                style={{
                  transition: "0.2s background-color",
                }}
              >
                Reset data
              </Button>
            </form>
          </Tabs.Panel>
          <Tabs.Panel value="role" pt="md">
            {selectedUserData && (
              <form
                onSubmit={roleForm.onSubmit(async (values) => {
                  await updateRoleMutation.mutateAsync({
                    userId: selectedUserId,
                    role: values.newRole as string,
                  });
                  void refetchUsersData();
                  handleFormClose();
                })}
              >
                <Select
                  data={["USER", "ADMIN"]}
                  label="Role"
                  {...roleForm.getInputProps("newRole")}
                  defaultValue={selectedUserData.role}
                  zIndex={1000}
                />
                <Button type="submit" mt={8}>
                  Save changes
                </Button>
              </form>
            )}
          </Tabs.Panel>
          <Tabs.Panel value="remove" pt="md">
            <Text>This action is destructive and irreversible</Text>
            <Group position="center">
              <Button
                color="red"
                mt={16}
                onClick={async () => {
                  await removeUserMutation.mutateAsync({
                    userId: selectedUserId,
                  });
                  void refetchUsersData();
                  handleFormClose();
                }}
              >
                Remove user
              </Button>
            </Group>
          </Tabs.Panel>
        </Tabs>
      </Modal>
      <UserTable
        onActionClick={(id) => {
          setSelectedUser(id);
          open();
        }}
        onSortClick={handleSortCLick}
        users={usersData.users}
      />
      <Pagination
        total={usersData.pages}
        value={page}
        onChange={setPage}
        sx={{ position: "fixed", bottom: 16, right: 16 }}
      />
    </>
  );
}

function UserTable({
  users,
  onSortClick,
  onActionClick,
}: {
  users: {
    id: string;
    username: string;
    displayName: string;
    role: string;
    followers: number;
    joinedAt: string;
    email: string;
  }[];
  onSortClick: (option: string) => void;
  onActionClick: (id: string) => void;
}) {
  const ths = (
    <tr>
      <th
        onClick={() => {
          onSortClick("usr");
        }}
      >
        <IconArrowsSort size={12} style={{ marginRight: 6 }} />
        Username
      </th>
      <th
        onClick={() => {
          onSortClick("dsp");
        }}
      >
        <IconArrowsSort size={12} style={{ marginRight: 6 }} />
        Display name
      </th>
      <th
        onClick={() => {
          onSortClick("rol");
        }}
      >
        <IconArrowsSort size={12} style={{ marginRight: 6 }} />
        Role
      </th>
      <th
        onClick={() => {
          onSortClick("flw");
        }}
      >
        <IconArrowsSort size={12} style={{ marginRight: 6 }} />
        Followers
      </th>
      <th
        onClick={() => {
          onSortClick("jdt");
        }}
      >
        <IconArrowsSort size={12} style={{ marginRight: 6 }} />
        Joined at
      </th>
      <th>E-mail</th>
      <th>Action</th>
    </tr>
  );

  const rows = users.map((r) => (
    <tr key={r.id}>
      <td>{r.username}</td>
      <td>{r.displayName}</td>
      <td>{r.role}</td>
      <td>{r.followers}</td>
      <td>{r.joinedAt}</td>
      <td>{r.email}</td>
      <td>
        <Button
          onClick={() => {
            onActionClick(r.id);
          }}
          variant="outline"
        >
          Manage
        </Button>
      </td>
    </tr>
  ));

  return (
    <Table>
      <thead>{ths}</thead>
      <tbody>{rows}</tbody>
    </Table>
  );
}
