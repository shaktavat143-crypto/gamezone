import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Sparkles, Smile } from 'lucide-react';
import { ChatMessage } from '../types.js';
import { socketService } from '../services/socket.js';
import { soundService } from '../services/sound.js';
import { PlayerAvatar } from './PlayerAvatar.js';

interface PartyChatProps {
  messages: ChatMessage[];
  myPlayerId: string;
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_EMOJIS = ['😂', '🔥', '👏', '🎮', '💀', '🎉', '🧠', '👀'];

export const PartyChat: React.FC<PartyChatProps> = ({
  messages,
  myPlayerId,
  isOpen,
  onClose
}) => {
  const [inputText, setInputText] = useState('');
  const chatScrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    socketService.sendChat(text);
    soundService.playChat();
    setInputText('');
  };

  const handleQuickEmoji = (emoji: string) => {
    socketService.sendChat(emoji);
    soundService.playChat();
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Chat Sidebar Drawer */}
      <div
        className={`fixed top-14 bottom-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-lg transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-violet-400" />
            <h2 className="font-bold text-sm text-white">Party Chat</h2>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
              {messages.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div ref={chatScrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500">
              <Smile className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-xs">No chat messages yet.</p>
              <p className="text-[11px] text-zinc-600">Say hello to the party!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.playerId === myPlayerId;
              const isSystem = msg.isSystem;

              if (isSystem) {
                return (
                  <div
                    key={msg.id}
                    className="my-2 rounded-lg bg-zinc-900/60 px-3 py-1.5 text-center text-[11px] text-zinc-400 border border-zinc-800/40"
                  >
                    <span className="mr-1.5">{msg.playerAvatar}</span>
                    <span>{msg.text}</span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <PlayerAvatar
                    avatar={msg.playerAvatar}
                    name={msg.playerName}
                    color={msg.playerColor}
                    size="xs"
                    className="mt-0.5"
                  />

                  <div
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}
                  >
                    <div className="flex items-baseline gap-1.5 mb-1 px-0.5">
                      <span
                        className="text-[11px] font-bold truncate max-w-[120px]"
                        style={{ color: msg.playerColor || '#A78BFA' }}
                      >
                        {msg.playerName}
                      </span>
                      <span className="text-[9px] text-zinc-500">{formatTime(msg.timestamp)}</span>
                    </div>
                    <div
                      className={`rounded-2xl px-3.5 py-2 text-xs max-w-full break-words shadow-sm ${
                        isMe
                          ? 'bg-violet-600 text-white rounded-tr-xs'
                          : 'bg-zinc-800 text-zinc-100 rounded-tl-xs border border-zinc-700/50'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Emoji Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2 border-t border-zinc-800/60 bg-zinc-900/40 scrollbar-none">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleQuickEmoji(emoji)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800/60 text-sm hover:scale-115 hover:bg-zinc-700 transition cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 border-t border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2">
            <input
              id="party-chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              maxLength={300}
              className="flex-1 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs text-white placeholder-zinc-500 border border-zinc-800 focus:border-violet-500 focus:outline-none transition"
            />
            <button
              id="send-chat-btn"
              type="submit"
              disabled={!inputText.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 transition cursor-pointer shadow-md shadow-violet-600/20"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
