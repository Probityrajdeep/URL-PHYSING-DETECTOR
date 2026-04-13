import { Outlet } from "react-router-dom";
import CyberBackground from "./CyberBackground.jsx";
import Header from "./Header.jsx";
import ChatbotWidget from "../chat/ChatbotWidget.jsx";

/** Shell: cyber background, sticky header, routed content, floating chatbot. */
export default function SiteLayout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <CyberBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="relative flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <Outlet />
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
}
