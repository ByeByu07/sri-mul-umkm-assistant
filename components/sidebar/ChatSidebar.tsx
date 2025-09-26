"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Plus, Trash2, Calendar, Bot, Edit } from "lucide-react";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useChatHistory, ChatSession } from "@/hooks/use-chat-history";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { HiDotsHorizontal } from "react-icons/hi";

interface ChatSidebarProps {
  className?: string;
  onChatSelect?: (chatId: string) => void;
  onNewChat?: () => void;
  selectedChatId?: string;
  onSummaryWithAI?: (chatId: string) => void;
  onRenameChat?: (chatId: string, title: string) => void;
  onDeleteChat?: (chatId: string) => void;
  chatSessions?: ChatSession[];
  isLoading?: boolean;
  error?: string | null;
}

export function ChatSidebar({
  className,
  onChatSelect,
  onNewChat,
  selectedChatId,
  onSummaryWithAI,
  onRenameChat,
  onDeleteChat,
  chatSessions: propChatSessions,
  isLoading: propIsLoading,
  error: propError
}: ChatSidebarProps) {

  // Use prop data if provided, otherwise use hook data
  const chatSessions = propChatSessions;
  const isLoading = propIsLoading;
  const error = propError;

const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set());

const toggleSummary = (sessionId: string, e: React.MouseEvent) => {
  e.stopPropagation();
  setExpandedSummaries(prev => {
    const newSet = new Set(prev);
    if (newSet.has(sessionId)) {
      newSet.delete(sessionId);
    } else {
      newSet.add(sessionId);
    }
    return newSet;
  });
};

  const handleNewChat = async () => {
    if (onNewChat) {
      onNewChat();
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus percakapan ini?')) {
      if (onDeleteChat) {
        onDeleteChat(chatId);
      }
    }
  };

  const handleSummaryWithAI = (chatId: string) => {
    if (onSummaryWithAI) {
      onSummaryWithAI(chatId);
    }
  };

  const handleRenameChat = (chatId: string) => {
    const title = prompt('Masukkan judul baru:');
    if (title && confirm('Apakah Anda yakin ingin mengubah judul percakapan ini?')) {
      if (onRenameChat) {
        onRenameChat(chatId, title);
      }
    }
  };

  const formatTimeAgo = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: localeId
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <SidebarGroup className={`flex-1 flex flex-col min-h-0 ${className}`}>
      <div className="flex items-center justify-between px-2 py-1">
        <SidebarGroupLabel>Histori Percakapan</SidebarGroupLabel>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleNewChat}
          className="h-6 w-6 p-0 hover:bg-muted"
          title="New Chat"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <SidebarGroupContent className="flex-1 flex flex-col min-h-0">
        <div className="space-y-1 px-2 flex-1 min-h-0 overflow-y-auto">
          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              {/* <p className="text-xs text-muted-foreground mt-2">Loading chats...</p> */}
            </div>
          )}

          {error && (
            <div className="text-center py-4">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {!isLoading && !error && chatSessions?.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Belum ada percakapan
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Klik + untuk memulai percakapan baru
              </p>
            </div>
          )}

{chatSessions?.map((session) => (
  <div
    key={session.id}
    className={`group relative p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
      selectedChatId === session.id
        ? 'bg-muted border-primary'
        : 'border-border hover:border-muted-foreground/20'
    }`}
    onClick={() => onChatSelect?.(session.id)}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {session.summary && (
            <button
              onClick={(e) => toggleSummary(session.id, e)}
              className="flex-shrink-0 p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
              title={expandedSummaries.has(session.id) ? "Hide summary" : "Show summary"}
            >
              {expandedSummaries.has(session.id) ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
          <h4 className="text-sm font-medium line-clamp-2 flex-1">
            {session.title}
          </h4>
        </div>
        
        {session.summary && expandedSummaries.has(session.id) && (
          <div className="mt-2 pl-5 text-xs text-muted-foreground">
            <div className="p-2 bg-muted/30 rounded border-l-2 border-muted-foreground/20">
              {session.summary}
            </div>
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-muted-foreground hover:text-foreground transition-opacity"
            title="More options"
          >
            <HiDotsHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent
          className="w-48 rounded-lg"
          side="right"
          align="start"
          sideOffset={4}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => handleSummaryWithAI(session.id)}>
              <Bot className="h-4 w-4" />
              Summary with AI
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRenameChat(session.id)}>
              <Edit className="h-4 w-4" />
              Rename
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => handleDeleteChat(session.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
))}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}