import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark";
export type ThemePalette = "gold" | "linear" | "emerald" | "violet" | "monochrome";

export interface PaletteInfo {
  id: ThemePalette;
  name: string;
  desc: string;
  previewColor: string;
  accentColor: string;
}

export const PALETTES: PaletteInfo[] = [
  {
    id: "gold",
    name: "Preto & Dourado (Royal Gold)",
    desc: "Preto ônix profundo e Ouro nobre radiante. Sofisticado, elegante e luxuoso.",
    previewColor: "#EAB308",
    accentColor: "#0A0A0C",
  },
  {
    id: "linear",
    name: "Linear / Obsidian",
    desc: "Preto Ônix com Azul Elétrico & Índigo. Ultra moderno e focado.",
    previewColor: "#6366F1",
    accentColor: "#38BDF8",
  },
  {
    id: "emerald",
    name: "Emerald Horizon",
    desc: "Verde Esmeralda e Floresta profunda. Relaxante e com alta clareza visual.",
    previewColor: "#10B981",
    accentColor: "#2DD4BF",
  },
  {
    id: "violet",
    name: "Midnight Violet",
    desc: "Ébano arroxeado com Violeta Neon e Rosa. Criativo e marcante.",
    previewColor: "#8B5CF6",
    accentColor: "#F472B6",
  },
  {
    id: "monochrome",
    name: "Warm Monochrome",
    desc: "Grafite e Carvão puro com Âmbar suave. Minimalista e neutro.",
    previewColor: "#71717A",
    accentColor: "#18181B",
  },
];

interface ThemeContextValue {
  theme: ThemeMode;
  palette: ThemePalette;
  setTheme: (theme: ThemeMode) => void;
  setPalette: (palette: ThemePalette) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = "zenith.theme.mode";
const PALETTE_STORAGE_KEY = "zenith.theme.palette";
const LEGACY_THEME_STORAGE_KEY = "aura.theme.mode";
const LEGACY_PALETTE_STORAGE_KEY = "aura.theme.palette";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [palette, setPaletteState] = useState<ThemePalette>("gold");

  useEffect(() => {
    // 1. Carregar Modo Claro/Escuro
    const storedTheme =
      (window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null) ||
      (window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY) as ThemeMode | null);
    let initialTheme: ThemeMode = "dark";
    if (storedTheme === "light" || storedTheme === "dark") {
      initialTheme = storedTheme;
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      initialTheme = prefersDark ? "dark" : "light";
    }
    setThemeState(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");

    // 2. Carregar Paleta de Cores
    const storedPalette =
      (window.localStorage.getItem(PALETTE_STORAGE_KEY) as ThemePalette | null) ||
      (window.localStorage.getItem(LEGACY_PALETTE_STORAGE_KEY) as ThemePalette | null);
    const initialPalette: ThemePalette =
      storedPalette && ["gold", "linear", "emerald", "violet", "monochrome"].includes(storedPalette)
        ? storedPalette
        : "gold";
    setPaletteState(initialPalette);
    document.documentElement.setAttribute("data-palette", initialPalette);
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const setPalette = (newPalette: ThemePalette) => {
    setPaletteState(newPalette);
    document.documentElement.setAttribute("data-palette", newPalette);
    window.localStorage.setItem(PALETTE_STORAGE_KEY, newPalette);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, palette, setTheme, setPalette, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme deve ser usado dentro de um <ThemeProvider>");
  }
  return ctx;
}
