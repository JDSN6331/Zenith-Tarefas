import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark";
export type ThemePalette = "claro" | "escuro" | "verde" | "quente" | "roxo";

export interface PaletteInfo {
  id: ThemePalette;
  name: string;
  desc: string;
  previewColor: string;
  accentColor: string;
  brandGradient: string;
}

export const PALETTES: PaletteInfo[] = [
  {
    id: "claro",
    name: "Claro (Sky Cyan & Navy)",
    desc: "Luminoso e nítido. Degradê branco ao azul marinho com arco ciano celeste.",
    previewColor: "#0284C7",
    accentColor: "#00F2FE",
    brandGradient: "linear-gradient(135deg, #4F46E5 0%, #00F2FE 100%)",
  },
  {
    id: "escuro",
    name: "Escuro (Midnight Cyan)",
    desc: "Preto espacial e azul cobalto com arco ciano elétrico e índigo real.",
    previewColor: "#00E5FF",
    accentColor: "#6366F1",
    brandGradient: "linear-gradient(135deg, #6366F1 0%, #00E5FF 100%)",
  },
  {
    id: "verde",
    name: "Verde (Emerald Aurora)",
    desc: "Floresta profunda e esmeralda nobre com arco aurora e menta neon.",
    previewColor: "#10B981",
    accentColor: "#4ADE80",
    brandGradient: "linear-gradient(135deg, #059669 0%, #4ADE80 100%)",
  },
  {
    id: "quente",
    name: "Quente (Amber Sunset)",
    desc: "Bronze e espresso profundo com arco solar dourado e âmbar radiante.",
    previewColor: "#F59E0B",
    accentColor: "#EA580C",
    brandGradient: "linear-gradient(135deg, #EA580C 0%, #FDE047 100%)",
  },
  {
    id: "roxo",
    name: "Roxo (Cosmic Amethyst)",
    desc: "Ébano e violeta cósmico com arco em degradê magenta e orquídea neon.",
    previewColor: "#A855F7",
    accentColor: "#EC4899",
    brandGradient: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
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
const LEGACY_PALETTES: Record<string, ThemePalette> = {
  gold: "quente",
  linear: "escuro",
  emerald: "verde",
  violet: "roxo",
  monochrome: "escuro",
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [palette, setPaletteState] = useState<ThemePalette>("escuro");

  useEffect(() => {
    // 1. Carregar Modo Claro/Escuro
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
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
    const storedPalette = window.localStorage.getItem(PALETTE_STORAGE_KEY);
    let initialPalette: ThemePalette = "escuro";

    if (storedPalette && ["claro", "escuro", "verde", "quente", "roxo"].includes(storedPalette)) {
      initialPalette = storedPalette as ThemePalette;
    } else if (storedPalette && LEGACY_PALETTES[storedPalette]) {
      initialPalette = LEGACY_PALETTES[storedPalette];
    }
    
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
