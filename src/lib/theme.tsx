import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./auth";

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
const VALID_PALETTES: ThemePalette[] = ["claro", "escuro", "verde", "quente", "roxo"];
const LEGACY_PALETTES: Record<string, ThemePalette> = {
  gold: "quente",
  linear: "escuro",
  emerald: "verde",
  violet: "roxo",
  monochrome: "escuro",
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, updateUserPreferences } = useAuth();
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [palette, setPaletteState] = useState<ThemePalette>("escuro");

  // Sincroniza o tema sempre que o usuário ativo mudar ou carregar da sessão
  useEffect(() => {
    if (!user) {
      // Estado sem usuário logado: usa o último tema global da tela inicial ou o padrão escuro
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      const initialTheme: ThemeMode = storedTheme === "light" ? "light" : "dark";

      const storedPalette = window.localStorage.getItem(PALETTE_STORAGE_KEY);
      let initialPalette: ThemePalette = "escuro";
      if (storedPalette && VALID_PALETTES.includes(storedPalette as ThemePalette)) {
        initialPalette = storedPalette as ThemePalette;
      } else if (storedPalette && LEGACY_PALETTES[storedPalette]) {
        initialPalette = LEGACY_PALETTES[storedPalette];
      }

      setThemeState(initialTheme);
      setPaletteState(initialPalette);
      document.documentElement.classList.toggle("dark", initialTheme === "dark");
      document.documentElement.setAttribute("data-palette", initialPalette);
      return;
    }

    // Usuário autenticado: restaura as preferências individuais salvas na conta deste usuário
    const userPrefTheme =
      user.themeMode ||
      (window.localStorage.getItem(`${THEME_STORAGE_KEY}.${user.id}`) as ThemeMode | null) ||
      "dark";

    const userPrefPaletteRaw =
      user.themePalette ||
      window.localStorage.getItem(`${PALETTE_STORAGE_KEY}.${user.id}`) ||
      "escuro";

    let finalPalette: ThemePalette = "escuro";
    if (VALID_PALETTES.includes(userPrefPaletteRaw as ThemePalette)) {
      finalPalette = userPrefPaletteRaw as ThemePalette;
    } else if (LEGACY_PALETTES[userPrefPaletteRaw]) {
      finalPalette = LEGACY_PALETTES[userPrefPaletteRaw];
    }

    const finalTheme: ThemeMode = userPrefTheme === "light" ? "light" : "dark";

    setThemeState(finalTheme);
    setPaletteState(finalPalette);
    document.documentElement.classList.toggle("dark", finalTheme === "dark");
    document.documentElement.setAttribute("data-palette", finalPalette);

    // Salva no cache isolado por usuário para carregamento instantâneo
    window.localStorage.setItem(`${THEME_STORAGE_KEY}.${user.id}`, finalTheme);
    window.localStorage.setItem(`${PALETTE_STORAGE_KEY}.${user.id}`, finalPalette);
  }, [user?.id, user?.themeMode, user?.themePalette]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    // Salva na conta do usuário individual
    if (user?.id) {
      window.localStorage.setItem(`${THEME_STORAGE_KEY}.${user.id}`, newTheme);
      updateUserPreferences({ themeMode: newTheme });
    }
    window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const setPalette = (newPalette: ThemePalette) => {
    setPaletteState(newPalette);
    document.documentElement.setAttribute("data-palette", newPalette);

    // Salva na conta do usuário individual
    if (user?.id) {
      window.localStorage.setItem(`${PALETTE_STORAGE_KEY}.${user.id}`, newPalette);
      updateUserPreferences({ themePalette: newPalette });
    }
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
