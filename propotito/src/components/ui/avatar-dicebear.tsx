"use client";

import { useMemo } from "react";

interface AvatarProps {
  seed: string; // email o nombre del usuario
  size?: number;
  style?: "avataaars" | "bottts" | "identicon" | "initials" | "lorelei" | "notionists";
  backgroundColor?: string;
  className?: string;
}

/**
 * Componente Avatar usando DiceBear API
 * Genera avatares únicos basados en el seed (email/nombre)
 * 
 * Ejemplos de uso:
 * <Avatar seed="user@email.com" size={64} />
 * <Avatar seed="John Doe" style="initials" />
 * <Avatar seed="admin" style="bottts" size={128} />
 */
export function Avatar({
  seed,
  size = 64,
  style = "avataaars",
  backgroundColor,
  className = "",
}: AvatarProps) {
  const avatarUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.append("seed", seed);
    
    if (backgroundColor) {
      params.append("backgroundColor", backgroundColor.replace("#", ""));
    }
    
    // Opciones específicas por estilo
    if (style === "avataaars") {
      params.append("clothing", "graphicShirt,hoodie,collarAndSweater");
      params.append("eyes", "happy,default,surprised");
      params.append("mouth", "smile,default");
    }
    
    return `https://api.dicebear.com/7.x/${style}/svg?${params.toString()}`;
  }, [seed, style, backgroundColor]);

  return (
    <img
      src={avatarUrl}
      alt={`Avatar de ${seed}`}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Hook para generar URL de avatar
 * Útil cuando necesitas la URL directamente (ej: para mostrar en tablas)
 */
export function useAvatarUrl(
  seed: string,
  options: {
    size?: number;
    style?: AvatarProps["style"];
    format?: "svg" | "png";
  } = {}
) {
  const { size = 128, style = "avataaars", format = "svg" } = options;
  
  return useMemo(() => {
    return `https://api.dicebear.com/7.x/${style}/${format}?seed=${encodeURIComponent(seed)}&size=${size}`;
  }, [seed, size, style, format]);
}

/**
 * Genera un color de fondo determinístico basado en el string
 * Útil para avatares tipo "iniciales"
 */
export function getAvatarColor(seed: string): string {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57",
    "#FF9FF3", "#54A0FF", "#48DBFB", "#1DD1A1", "#FFC048",
    "#9980FA", "#FDA7DF", "#F79F1F", "#A3CB38", "#12CBC4",
  ];
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Componente Avatar con iniciales (alternativa sin API externa)
 */
export function InitialsAvatar({
  name,
  size = 64,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = useMemo(() => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [name]);

  const backgroundColor = useMemo(() => getAvatarColor(name), [name]);

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor,
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  );
}

// Ejemplos de uso:
// <Avatar seed={user.email} size={64} style="avataaars" />
// <Avatar seed={user.email} size={32} style="identicon" />
// <InitialsAvatar name={user.firstName} size={40} />
