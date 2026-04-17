import { useEffect } from "react";

const INJECT_URL = "https://cdn.botpress.cloud/webchat/v3.6/inject.js";
const BOT_URL = "https://files.bpcontent.cloud/2026/04/17/04/20260417045824-U3TYYNOM.js";

/** Loads Botpress webchat scripts globally. */
export default function ChatbotWidget() {
  useEffect(() => {
    if (document.querySelector(`script[src="${INJECT_URL}"]`) || document.querySelector(`script[src="${BOT_URL}"]`)) {
      return;
    }

    const injectScript = document.createElement("script");
    injectScript.src = INJECT_URL;
    injectScript.async = true;

    const botScript = document.createElement("script");
    botScript.src = BOT_URL;
    botScript.defer = true;

    document.body.appendChild(injectScript);
    document.body.appendChild(botScript);
  }, []);

  return null;
}
