import { toast as sonnerToast } from "sonner";

// Estilos base para cada tipo de toast - Colores vibrantes tipo Push Notification
const toastStyles = {
  success: {
    style: {
      background: "rgba(34, 197, 94, 0.85)",
      border: "2px solid #166534",
      color: "#052e16",
    },
    className: "[&_svg]:text-green-950",
  },
  error: {
    style: {
      background: "rgba(239, 68, 68, 0.85)",
      border: "2px solid #991b1b",
      color: "#450a0a",
    },
    className: "[&_svg]:text-red-950 [&_[data-title]]:font-black",
  },
  warning: {
    style: {
      background: "rgba(251, 191, 36, 0.85)",
      border: "2px solid #92400e",
      color: "#451a03",
    },
    className: "[&_svg]:text-amber-950",
  },
  info: {
    style: {
      background: "rgba(59, 130, 246, 0.85)",
      border: "2px solid #1e40af",
      color: "#172554",
    },
    className: "[&_svg]:text-blue-950",
  },
  loading: {
    style: {
      background: "rgba(148, 163, 184, 0.85)",
      border: "2px solid #475569",
      color: "#0f172a",
    },
    className: "[&_svg]:text-slate-950",
  },
};

// Funciones de toast con estilos personalizados
export const toast = {
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
      ...toastStyles.success,
    });
  },
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
      ...toastStyles.error,
    });
  },
  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, {
      description,
      ...toastStyles.warning,
    });
  },
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, {
      description,
      ...toastStyles.info,
    });
  },
  loading: (message: string, description?: string) => {
    return sonnerToast.loading(message, {
      description,
      ...toastStyles.loading,
    });
  },
  // También exportamos el toast original por si se necesita
  original: sonnerToast,
};

export default toast;
