import { MantineProvider } from "@mantine/core";
import { getCookie, setCookie } from "cookies-next";
import React, { useContext, useEffect, useState } from "react";
import type { ColorTheme } from "~/utils/types";

const ThemeContext = React.createContext({
  theme: "dark",
  toggleTheme: () => {
    return;
  },
});

export function ThemeManager({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ColorTheme>("dark");

  useEffect(() => {
    setTheme(getCookie("color-theme") as ColorTheme);
  }, []);

  const toggleTheme = (value?: ColorTheme) => {
    const nextColorTheme = value || (theme === "dark" ? "light" : "dark");

    setTheme(nextColorTheme);
    setCookie("color-theme", nextColorTheme, {
      maxAge: 60 * 60 * 24 * 30,
    });
  };

  return (
    <ThemeContext.Provider value={{ theme: theme, toggleTheme: toggleTheme }}>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: theme,
          fontFamily: "Roboto Flex, sans-serif",
          primaryColor: "blue",
          components: {
            Table: {
              defaultProps: {
                withColumnBorders: true,
                withBorder: true,
                style: {
                  borderTop: "0",
                  borderLeft: "0",
                  borderRight: "0",
                },
              },
            },
            Textarea: {
              defaultProps: {
                size: "md",
              },
            },
            TextInput: {
              defaultProps: {
                size: "md",
              },
            },
            Modal: {
              defaultProps: {
                styles: {
                  root: {
                    ".mantine-Modal-inner": {
                      boxSizing: "border-box",
                    },
                  },
                },
              },
            },
            Text: {
              defaultProps: (t) => ({
                color: t.colorScheme === "dark" ? t.colors.dark[0] : t.black,
              }),
            },
            RichTextEditor: {
              defaultProps: (t) => ({
                styles: {
                  root: {
                    ".ProseMirror": {
                      backgroundColor:
                        t.colorScheme === "dark" ? t.colors.dark[6] : t.white,
                    },
                    ".embed-image": {
                      width: "100%",
                    },
                  },
                  content: {
                    fontSize: 16,
                  },
                  toolbar: {
                    backgroundColor:
                      t.colorScheme === "dark"
                        ? t.colors.dark[7]
                        : t.colors.gray[1],
                  },
                  control: {},
                },
              }),
            },
          },
        }}
      >
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
