import {
  AppShell,
  Burger,
  Button,
  Container,
  Flex,
  Group,
  Header,
  MediaQuery,
  Navbar,
  NavLink,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useThemeContext } from "./ThemeManager";
import { Notifications } from "@mantine/notifications";
import Link from "next/link";
import {
  IconArrowBackUp,
  IconFlag,
  IconHome,
  IconServerCog,
  IconSettings,
  IconTrendingUp,
  IconUsers,
  IconBrightness,
  IconLogin,
} from "@tabler/icons-react";
import Image from "next/image";

export function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data } = useSession();
  const theme = useThemeContext();
  const mantineTheme = useMantineTheme();
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (opened) {
      setOpened(false);
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  useEffect(() => {
    document.body.style.backgroundColor =
      mantineTheme.colorScheme === "dark"
        ? mantineTheme.colors.dark[8]
        : mantineTheme.colors.gray[0];
  }, [
    mantineTheme.colorScheme,
    mantineTheme.colors.dark,
    mantineTheme.colors.gray,
  ]);

  return (
    <>
      <Notifications autoClose={5000} />
      <AppShell
        padding={0}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        styles={(theme) => ({
          main: {
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        })}
        navbar={
          <Navbar
            p="md"
            hiddenBreakpoint="sm"
            hidden={!opened}
            width={{ sm: 300, lg: 300 }}
          >
            <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
              <Navbar.Section py={16}>
                <Text
                  size={36}
                  style={{ fontFamily: "Big Shoulders Display, cursive" }}
                  align="center"
                >
                  Knowhow
                </Text>
              </Navbar.Section>
            </MediaQuery>
            <Navbar.Section grow mt="md">
              <MainLinks />
            </Navbar.Section>
            <Navbar.Section>
              <Flex justify="space-between" gap={8}>
                {data?.user ? (
                  <Button
                    style={{ flexGrow: 1 }}
                    onClick={() => {
                      void signOut({
                        callbackUrl:
                          process.env.NEXT_PUBLIC_LOGOUT_CALLBACK_URL,
                      });
                    }}
                  >
                    <IconLogin size="1.25rem" style={{ marginRight: 4 }} />
                    <span>Sign out</span>
                  </Button>
                ) : (
                  <Button
                    style={{ flexGrow: 1 }}
                    onClick={() => {
                      void signIn();
                    }}
                  >
                    <IconLogin size="1.25rem" style={{ marginRight: 4 }} />
                    <span>Sign in</span>
                  </Button>
                )}

                <Button
                  onClick={() => {
                    theme.toggleTheme();
                  }}
                  style={{ flexGrow: 1 }}
                >
                  <IconBrightness size="1.25rem" style={{ marginRight: 4 }} />
                  <span>Theme</span>
                </Button>
              </Flex>
            </Navbar.Section>
          </Navbar>
        }
        header={
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Header height={{ base: 48, sm: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  height: "100%",
                }}
              >
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  size={24}
                  mr="xl"
                  pos="absolute"
                  top={8}
                  left={8}
                />
                <Text
                  size={24}
                  style={{
                    fontFamily: "Big Shoulders Display, cursive",
                  }}
                  align="center"
                >
                  Knowhow
                </Text>
              </div>
            </Header>
          </MediaQuery>
        }
      >
        {router.pathname.split("/")[1] === "admin" ? (
          <>{children}</>
        ) : (
          <Container
            mih="100lvh"
            p={16}
            size="md"
            sx={{ boxSizing: "border-box" }}
          >
            {children}
          </Container>
        )}
      </AppShell>
    </>
  );
}

interface MainLinkProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

function MainLink({ icon, label, href, active }: MainLinkProps) {
  return (
    <NavLink
      component={Link}
      label={
        <Group>
          {icon}
          <Text size="lg">{label}</Text>
        </Group>
      }
      active={active}
      href={href}
      sx={(theme) => ({
        display: "block",
        width: "100%",
        padding: theme.spacing.md,
        borderRadius: theme.radius.sm,
        color:
          theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

        "&:hover": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[0],
        },
      })}
    />
  );
}

function MainLinks() {
  const session = useSession();
  const router = useRouter();

  let links: MainLinkProps[] = [];

  if (
    session.data?.user.role === "ADMIN" &&
    router.pathname.split("/")[1] === "admin"
  ) {
    links = [
      {
        icon: <IconArrowBackUp size="2rem" strokeWidth={1} />,
        label: "Main application",
        href: "/",
      },
      {
        icon: <IconFlag size="2rem" strokeWidth={1} />,
        label: "Resolve reports",
        href: "/admin/reports",
      },
      {
        icon: <IconUsers size="2rem" strokeWidth={1} />,
        label: "Manage users",
        href: "/admin/users",
      },
    ];
  } else if (session.data?.user.role === "ADMIN") {
    links = [
      {
        icon: <IconHome size="2rem" strokeWidth={1} />,
        label: "Home",
        href: "/",
      },
      {
        icon: <IconTrendingUp size="2rem" strokeWidth={1} />,
        label: "Trending",
        href: "/trending",
      },
      {
        icon: <IconSettings size="2rem" strokeWidth={1} />,
        label: "Settings",
        href: "/settings",
      },
      {
        icon: (
          <Image
            alt="User image"
            src={session.data.user.image ?? "/defaultUserImage.webp"}
            width={32}
            height={32}
            style={{
              borderRadius: 4,
            }}
          />
        ),
        label: "Profile",
        href: `/user/${session.data?.user.username ?? ""}`,
      },
      {
        icon: <IconServerCog size="2rem" strokeWidth={1} />,
        label: "Admin panel",
        href: "/admin/reports",
      },
    ];
  } else if (session.data?.user.role === "USER") {
    links = [
      {
        icon: <IconHome size="2rem" strokeWidth={1} />,
        label: "Home",
        href: "/",
      },
      {
        icon: <IconTrendingUp size="2rem" strokeWidth={1} />,
        label: "Trending",
        href: "/trending",
      },
      {
        icon: <IconSettings size="2rem" strokeWidth={1} />,
        label: "Settings",
        href: "/settings",
      },
      {
        icon: (
          <Image
            alt="User image"
            src={session.data.user.image ?? "/defaultUserImage.webp"}
            width={32}
            height={32}
            style={{
              borderRadius: 4,
            }}
          />
        ),
        label: "Profile",
        href: `/user/${session.data?.user.username ?? ""}`,
      },
    ];
  } else {
    links = [
      {
        icon: <IconHome size="2rem" strokeWidth={1} />,
        label: "Home",
        href: "/",
      },
      {
        icon: <IconTrendingUp size="2rem" strokeWidth={1} />,
        label: "Trending",
        href: "/trending",
      },
    ];
  }

  return (
    <>
      {links.map((link) => (
        <MainLink
          {...link}
          key={link.label}
          active={router.asPath === link.href}
        />
      ))}
    </>
  );
}
