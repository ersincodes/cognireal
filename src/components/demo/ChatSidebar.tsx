"use client";

import { useEffect, useState } from "react";
import { FileText, MessageSquarePlus, Trash2, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/i18n/LanguageContext";
import { useDemoContext } from "./DemoProvider";
import type { DemoChat } from "@/lib/demo/store";

interface ChatSidebarProps {
  className?: string;
}

const formatChatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const getChatActivityTime = (chat: DemoChat): number => {
  const last = chat.messages.at(-1);
  return last?.timestamp ?? chat.createdAt;
};

const getChatSubtitle = (
  chat: DemoChat,
  t: (key: string) => string
): string => {
  if (chat.messages.length === 0 && !chat.document) {
    return t("demoPage.chatEmpty");
  }
  return formatChatDate(getChatActivityTime(chat));
};

const ChatSidebar = ({ className = "" }: ChatSidebarProps) => {
  const { t } = useLanguage();
  const {
    store,
    activeChat,
    createChat,
    selectChat,
    deleteChat,
    isSidebarOpen,
    setSidebarOpen,
  } = useDemoContext();

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const sortedChats = [...store.chats].sort(
    (a, b) => getChatActivityTime(b) - getChatActivityTime(a)
  );

  useEffect(() => {
    if (!isSidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPendingDeleteId(null);
        setSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen, setSidebarOpen]);

  const handleCreateChat = () => {
    setPendingDeleteId(null);
    createChat();
  };

  const handleSelectChat = (id: string) => {
    setPendingDeleteId(null);
    selectChat(id);
  };

  const handleCloseSidebar = () => {
    setPendingDeleteId(null);
    setSidebarOpen(false);
  };

  const handleConfirmDelete = (id: string) => {
    deleteChat(id);
    setPendingDeleteId(null);
  };

  const renderChatRow = (chat: DemoChat) => {
    const isActive = chat.id === activeChat?.id;
    const isPendingDelete = pendingDeleteId === chat.id;

    return (
      <li
        key={chat.id}
        className={`group flex items-center gap-1 rounded-xl transition-colors ${
          isActive
            ? "bg-brand-blue/10 text-brand-dark"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <button
          type="button"
          onClick={() => handleSelectChat(chat.id)}
          aria-current={isActive ? "true" : undefined}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
        >
          {chat.document && (
            <FileText
              className="h-4 w-4 shrink-0 text-brand-blue"
              aria-hidden="true"
            />
          )}
          <span className="min-w-0 flex-1">
            <span
              title={chat.title}
              className={`block truncate text-sm ${isActive ? "font-semibold" : "font-medium"}`}
            >
              {chat.title}
            </span>
            <span className="block text-xs text-gray-400">
              {getChatSubtitle(chat, t)}
            </span>
          </span>
        </button>

        {isPendingDelete ? (
          <div className="flex shrink-0 items-center gap-0.5 pr-2">
            <button
              type="button"
              onClick={() => setPendingDeleteId(null)}
              className="rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
            >
              {t("demoPage.cancelDelete")}
            </button>
            <button
              type="button"
              onClick={() => handleConfirmDelete(chat.id)}
              className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            >
              {t("demoPage.confirmDelete")}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPendingDeleteId(chat.id)}
            className="mr-2 shrink-0 rounded-lg p-1 text-gray-400 opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 md:opacity-0 md:group-hover:opacity-100"
            aria-label={t("demoPage.deleteChat")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </li>
    );
  };

  const sidebarContent = (
    <aside
      className={`flex h-full w-[280px] shrink-0 flex-col border-r border-gray-200 bg-white ${className}`}
    >
      <div className="flex items-start justify-between border-b border-gray-100 pr-4 pt-4 pb-3 pl-0">
        <div className="flex min-w-0 flex-col items-start gap-2">
          <Link
            href="/"
            aria-label={t("navbar.logoAlt")}
            className="block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
          >
            <div className="relative h-11 w-40 overflow-hidden">
              <Image
                src="/assets/logo-nav.png"
                alt=""
                width={320}
                height={64}
                className="absolute left-0 top-1/2 h-44 w-44 -translate-y-1/2 object-contain object-left"
                priority
              />
            </div>
          </Link>
          <p className="pl-4 text-xs font-medium uppercase tracking-wider text-gray-500">
            {t("demoPage.title")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCloseSidebar}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 md:hidden"
          aria-label={t("demoPage.closeSidebar")}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-3">
        <button
          type="button"
          onClick={handleCreateChat}
          className="flex w-full items-center justify-start gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
        >
          <MessageSquarePlus className="h-4 w-4" />
          {t("demoPage.newChat")}
        </button>
      </div>

      <nav
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-4"
        aria-label={t("demoPage.previousChats")}
      >
        <p className="mb-2 mt-2 px-2 text-xs font-medium uppercase tracking-wider text-gray-400">
          {t("demoPage.previousChats")}
        </p>
        {sortedChats.length === 0 ? (
          <p className="px-2 text-sm text-gray-400">{t("demoPage.noChats")}</p>
        ) : (
          <ul role="list" className="flex flex-col gap-1">
            {sortedChats.map(renderChatRow)}
          </ul>
        )}
      </nav>
    </aside>
  );

  return (
    <>
      <div className="hidden h-full md:flex">{sidebarContent}</div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t("demoPage.previousChats")}
        >
          <div
            className="absolute inset-0 bg-black/40 transition-opacity"
            onClick={handleCloseSidebar}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex translate-x-0 shadow-xl transition-transform duration-200 ease-out">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatSidebar;
