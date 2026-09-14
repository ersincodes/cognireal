export const CALENDLY_URL = "https://calendly.com/ersin-cognireal/30min";

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

export const openCalendlyPopup = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  if (window.Calendly) {
    window.Calendly.initPopupWidget({ url: CALENDLY_URL });
    return;
  }

  window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
};
