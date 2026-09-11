import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Smile, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types.js';
import { socketService } from '../services/socket.js';
import { soundService } from '../services/sound.js';
import { PlayerAvatar } from './PlayerAvatar.js';

interface LobbyChatProps {
  messages: ChatMessage[];
  myPlayerId: string;
}

const QUICK_EMOJIS = ['👋', '🔥', '😂', '🎮', '💀', '🎉', '🚀', '👀'];

export const LobbyChat: React.FC<LobbyChatProps> = ({
  messages,
  myPlayerId
}) => {
  const [inputText, setInputText] = useState('');
  const chatScrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
    <div className="flex h-full flex-col rounded-3xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl shadow-xl overflow-hidden min-h-[420px] max-h-[560px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <MessageSquare className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-white">Party Live Chat</h3>
          </div>
        </div>
        <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-400 border border-zinc-700/50">
          {messages.length} msgs
        </span>
      </div>

      {/* Message Stream */}
      <div ref={chatScrollContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 overscroll-contain no-scrollbar">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500 py-8">
            <Smile className="h-8 w-8 mb-2 text-zinc-600" />
            <p className="text-xs font-semibold text-zinc-400">Party chat is quiet</p>
            <p className="text-[11px] text-zinc-600">Send a greeting to your squad!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.playerId === myPlayerId;
            const isSystem = msg.isSystem;

            if (isSystem) {
              return (
                <div
                  key={msg.id}
                  className="my-1.5 rounded-xl bg-zinc-900/70 px-3 py-1.5 text-center text-[11px] text-zinc-400 border border-zinc-800/60"
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

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  <div className="flex items-center gap-1.5 mb-0.5 px-0.5">
                    <span
                      className="text-[11px] font-bold truncate max-w-[120px]"
                      style={{ color: msg.playerColor || '#A78BFA' }}
                    >
                      {msg.playerName}
                    </span>
                    <span className="text-[9px] text-zinc-500">{formatTime(msg.timestamp)}</span>
                  </div>

                  <div
                    className={`rounded-2xl px-3.5 py-2 text-xs break-words shadow-sm ${
                      isMe
                        ? 'bg-violet-600 text-white rounded-tr-xs'
                        : 'bg-zinc-900 text-zinc-100 rounded-tl-xs border border-zinc-800/80'
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

      {/* Quick Reaction Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2 border-t border-zinc-800/60 bg-zinc-900/30 shrink-0 no-scrollbar">
        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mr-1 shrink-0">
          React:
        </span>
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleQuickEmoji(emoji)}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-base hover:scale-110 hover:bg-zinc-800 hover:border-violet-500/40 transition cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-zinc-800/80 bg-zinc-950 shrink-0">
        <div className="flex items-center gap-2">
          <input
            id="lobby-chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message to the lobby..."
            maxLength={300}
            className="flex-1 h-11 rounded-xl bg-zinc-900 px-3.5 text-xs text-white placeholder-zinc-500 border border-zinc-800 focus:border-violet-500 focus:outline-none transition"
          />
          <button
            id="lobby-chat-send-btn"
            type="submit"
            disabled={!inputText.trim()}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 transition cursor-pointer shadow-md shadow-violet-600/20 shrink-0"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
