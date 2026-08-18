import React, { useState } from 'react';
import {
  Gamepad2,
  Copy,
  Check,
  Link,
  Volume2,
  VolumeX,
  Trophy,
  Settings,
  LogOut,
  Radio,
  Lock,
  Unlock,
  MessageSquare
} from 'lucide-react';
import { ClientPartyView, ConnectionStatus } from '../types.js';
import { soundService } from '../services/sound.js';
import { socketService } from '../services/socket.js';

interface NavbarProps {
  party: ClientPartyView | null;
  connectionStatus: ConnectionStatus;
  onOpenScoreboard: () => void;
  onOpenHostControls: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  unreadChatCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  party,
  connectionStatus,
  onOpenScoreboard,
  onOpenHostControls,
  onToggleChat,
  isChatOpen,
  unreadChatCount
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMuted, setIsMuted] = useState(soundService.getIsMuted());

  const handleCopyCode = () => {
    if (!party) return;
    navigator.clipboard.writeText(party.code);
    soundService.playClick();
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!party) return;
    const url = `${window.location.origin}/join/${party.code}`;
    navigator.clipboard.writeText(url);
    soundService.playClick();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleMute = () => {
    const muted = soundService.toggleMute();
    setIsMuted(muted);
    if (!muted) soundService.playClick();
  };

  const handleLeave = () => {
    if (confirm('Are you sure you want to leave this party?')) {
      socketService.leaveParty();
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
        {/* Brand Logo & Party Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-md shadow-indigo-500/20">
            <Gamepad2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-white text-base sm:text-lg">
                GAME<span className="text-violet-400">ZONE</span>
              </span>
              {party && (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs font-semibold text-zinc-300 border border-zinc-700/60">
                  {party.isLocked ? <Lock className="h-3 w-3 text-amber-400" /> : <Unlock className="h-3 w-3 text-emerald-400" />}
                  {party.name}
                </span>
              )}
            </div>
            {party && (
              <p className="text-[11px] text-zinc-400 sm:hidden truncate max-w-[140px]">
                {party.name}
              </p>
            )}
          </div>
        </div>

        {/* Center: Party Code & Invite Pills (if inside a party) */}
        {party && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="copy-party-code-btn"
              onClick={handleCopyCode}
              className="group flex items-center gap-1.5 rounded-lg bg-zinc-900 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-mono font-bold tracking-wider text-violet-300 border border-violet-500/30 hover:border-violet-500 hover:bg-violet-950/40 transition-all cursor-pointer shadow-sm"
              title="Click to copy party code"
            >
              <span className="text-zinc-400 font-sans font-normal text-[11px] hidden md:inline">Code:</span>
              <span className="text-violet-300 font-bold">{party.code}</span>
              {copiedCode ? (
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-zinc-400 group-hover:text-violet-300 shrink-0" />
              )}
            </button>

            <button
              id="copy-invite-link-btn"
              onClick={handleCopyLink}
              className="flex items-center gap-1 rounded-lg bg-zinc-900 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition-all cursor-pointer"
              title="Copy shareable party link"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 hidden sm:inline text-[11px]">Copied!</span>
                </>
              ) : (
                <>
                  <Link className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="hidden sm:inline text-[11px]">Invite Link</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Right: Actions & Indicators */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Connection status indicator */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
              connectionStatus === 'connected'
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                : connectionStatus === 'reconnecting'
                ? 'bg-amber-950/40 text-amber-300 border-amber-800/50 animate-pulse'
                : 'bg-rose-950/40 text-rose-300 border-rose-800/50'
            }`}
            title={`Status: ${connectionStatus}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-400'
                  : connectionStatus === 'reconnecting'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-rose-500'
              }`}
            />
            <span className="hidden lg:inline capitalize">{connectionStatus}</span>
          </div>

          {/* Sound Toggle */}
          <button
            id="toggle-sound-btn"
            onClick={handleToggleMute}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-zinc-500" /> : <Volume2 className="h-4 w-4 text-zinc-200" />}
          </button>

          {party && (
            <>
              {/* Leaderboard Scoreboard Button */}
              <button
                id="view-scoreboard-btn"
                onClick={() => {
                  soundService.playClick();
                  onOpenScoreboard();
                }}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 hover:bg-amber-950/30 hover:border-amber-700/50 transition cursor-pointer"
                title="Overall Party Scores"
              >
                <Trophy className="h-4 w-4" />
              </button>

              {/* Host Controls Button (if Host) */}
              {party.isHost && (
                <button
                  id="host-settings-btn"
                  onClick={() => {
                    soundService.playClick();
                    onOpenHostControls();
                  }}
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                  title="Host Party Controls"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}

              {/* Chat Toggle Button */}
              <button
                id="toggle-chat-btn"
                onClick={() => {
                  soundService.playClick();
                  onToggleChat();
                }}
                className={`relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border transition cursor-pointer ${
                  isChatOpen
                    ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/20'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Toggle Party Chat"
              >
                <MessageSquare className="h-4 w-4" />
                {unreadChatCount > 0 && !isChatOpen && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
                    {unreadChatCount > 9 ? '9+' : unreadChatCount}
                  </span>
                )}
              </button>

              {/* Leave Party Button */}
              <button
                id="leave-party-btn"
                onClick={handleLeave}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/20 transition cursor-pointer"
                title="Leave Party"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
