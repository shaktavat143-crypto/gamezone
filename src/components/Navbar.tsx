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
  Lock,
  Unlock,
  MessageSquare
} from 'lucide-react';
import { ClientPartyView, ConnectionStatus } from '../types.js';
import { soundService } from '../services/sound.js';
import { socketService } from '../services/socket.js';
import { ConfirmModal } from './ConfirmModal.js';

interface NavbarProps {
  party: ClientPartyView | null;
  connectionStatus?: ConnectionStatus;
  onOpenScoreboard: () => void;
  onOpenHostControls: () => void;
  onToggleChat: () => void;
  onLeaveParty?: () => void;
  isChatOpen: boolean;
  unreadChatCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  party,
  connectionStatus = 'connected',
  onOpenScoreboard,
  onOpenHostControls,
  onToggleChat,
  onLeaveParty,
  isChatOpen,
  unreadChatCount = 0
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMuted, setIsMuted] = useState(soundService.getIsMuted());
  const [showLeaveModal, setShowLeaveModal] = useState(false);

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

  const handleLeaveClick = () => {
    soundService.playClick();
    setShowLeaveModal(true);
  };

  const handleConfirmLeave = () => {
    soundService.playClick();
    setShowLeaveModal(false);
    if (onLeaveParty) {
      onLeaveParty();
    } else {
      socketService.leaveParty();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md overflow-hidden">
      {/* Primary Top Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-2 sm:px-6 py-1.5 sm:py-2.5 w-full max-w-full overflow-hidden">
        {/* Brand Logo & Party Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-md shadow-indigo-500/20 shrink-0">
            <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black tracking-tight text-white text-sm sm:text-lg shrink-0">
                GAME<span className="text-violet-400">ZONE</span>
              </span>
              {party && (
                <span className="hidden lg:inline-flex items-center gap-1.5 rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs font-semibold text-zinc-300 border border-zinc-700/60">
                  {party.isLocked ? (
                    <Lock className="h-3 w-3 text-amber-400" />
                  ) : (
                    <Unlock className="h-3 w-3 text-emerald-400" />
                  )}
                  <span className="truncate max-w-[130px]">{party.name}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Party Code & Invite Pills (Desktop only) */}
        {party && (
          <div className="hidden md:flex items-center gap-2">
            <button
              id="copy-party-code-btn"
              onClick={handleCopyCode}
              className="group flex h-11 items-center gap-1.5 rounded-xl bg-zinc-900 px-3 text-xs font-mono font-bold tracking-wider text-violet-300 border border-violet-500/30 hover:border-violet-500 hover:bg-violet-950/40 transition-all cursor-pointer shadow-sm"
              title="Click to copy party code"
            >
              <span className="text-zinc-400 font-sans font-normal text-[11px]">Code:</span>
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
              className="flex h-11 items-center gap-1.5 rounded-xl bg-zinc-900 px-3 text-xs font-medium text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition-all cursor-pointer"
              title="Copy shareable party link"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-xs">Copied!</span>
                </>
              ) : (
                <>
                  <Link className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-xs">Invite Link</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Desktop Right Group: Status, Sound, Leaderboard, Settings, Chat, Leave */}
        <div className="hidden md:flex items-center gap-2">
          {/* Connection status */}
          <div
            className={`flex h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-medium border ${
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
            <span className="capitalize">{connectionStatus}</span>
          </div>

          {/* Sound Toggle */}
          <button
            id="toggle-sound-btn"
            onClick={handleToggleMute}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            aria-label={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
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
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 hover:bg-amber-950/30 hover:border-amber-700/50 transition cursor-pointer"
                title="Overall Party Scores"
                aria-label="Overall Party Scores"
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
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                  title="Host Party Controls"
                  aria-label="Host Party Controls"
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
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl border transition cursor-pointer ${
                  isChatOpen
                    ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/20'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Toggle Party Chat"
                aria-label="Toggle Party Chat"
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
                onClick={handleLeaveClick}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/20 transition cursor-pointer"
                title="Leave Party"
                aria-label="Leave Party"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Right Group: Direct action buttons visible on screen without scrolling! */}
        <div className="flex md:hidden items-center gap-1 sm:gap-1.5 shrink-0">
          {party ? (
            <>
              {/* Leaderboard Button */}
              <button
                id="view-scoreboard-btn-mobile"
                onClick={() => {
                  soundService.playClick();
                  onOpenScoreboard();
                }}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 hover:bg-amber-950/30 hover:border-amber-700/50 transition cursor-pointer shrink-0"
                title="Leaderboard"
                aria-label="Leaderboard"
              >
                <Trophy className="h-4 w-4" />
              </button>

              {/* Host Settings Button (if Host) */}
              {party.isHost && (
                <button
                  id="host-settings-btn-mobile"
                  onClick={() => {
                    soundService.playClick();
                    onOpenHostControls();
                  }}
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition cursor-pointer shrink-0"
                  title="Host Settings"
                  aria-label="Host Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}

              {/* Chat Toggle Button */}
              <button
                id="toggle-chat-btn-mobile"
                onClick={() => {
                  soundService.playClick();
                  onToggleChat();
                }}
                className={`relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl border transition cursor-pointer shrink-0 ${
                  isChatOpen
                    ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/20'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Party Chat"
                aria-label="Party Chat"
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
                id="leave-party-btn-mobile"
                onClick={handleLeaveClick}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/20 transition cursor-pointer shrink-0"
                title="Leave Party"
                aria-label="Leave Party"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              {/* Sound Toggle (Home screen mobile) */}
              <button
                id="toggle-sound-btn-mobile"
                onClick={handleToggleMute}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer shrink-0"
                title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-zinc-500" /> : <Volume2 className="h-4 w-4 text-zinc-200" />}
              </button>

              {/* Connection status indicator */}
              <div
                className="flex h-9 items-center gap-1.5 rounded-lg bg-zinc-900 px-2.5 border border-zinc-800 text-xs text-zinc-400 shrink-0"
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
                <span className="capitalize text-[11px]">{connectionStatus}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Sub-Bar: Party Code, Invite Link, Sound & Status (when inside party) */}
      {party && (
        <div className="md:hidden border-t border-zinc-800/80 bg-zinc-900/50 px-2 sm:px-4 py-1.5 flex items-center justify-between gap-1.5 w-full max-w-full overflow-hidden">
          {/* Party Code & Invite Link */}
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              id="copy-party-code-btn-mobile"
              onClick={handleCopyCode}
              className="flex h-9 items-center gap-1 rounded-lg bg-zinc-900 px-2 text-xs font-mono font-bold tracking-wider text-violet-300 border border-violet-500/30 hover:border-violet-500 transition cursor-pointer shrink-0"
              title="Tap to copy party code"
            >
              <span className="text-zinc-400 font-sans font-normal text-[10px]">Code:</span>
              <span className="text-violet-300 font-bold">{party.code}</span>
              {copiedCode ? (
                <Check className="h-3 w-3 text-emerald-400 shrink-0" />
              ) : (
                <Copy className="h-3 w-3 text-zinc-400 shrink-0" />
              )}
            </button>

            <button
              id="copy-invite-link-btn-mobile"
              onClick={handleCopyLink}
              className="flex h-9 items-center gap-1 rounded-lg bg-zinc-900 px-2 text-xs font-medium text-zinc-300 border border-zinc-800 transition cursor-pointer shrink-0"
              title="Copy invite link"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400 text-[10px]">Copied</span>
                </>
              ) : (
                <>
                  <Link className="h-3 w-3 text-zinc-400" />
                  <span className="text-zinc-300 text-[10px]">Invite</span>
                </>
              )}
            </button>
          </div>

          {/* Sound Toggle & Status Indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="toggle-sound-subbar-btn-mobile"
              onClick={handleToggleMute}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5 text-zinc-500" /> : <Volume2 className="h-3.5 w-3.5 text-zinc-200" />}
            </button>

            <div
              className="flex h-9 items-center gap-1 rounded-lg bg-zinc-900 px-2 border border-zinc-800 text-[10px] text-zinc-400"
              title={`Status: ${connectionStatus}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-400'
                    : connectionStatus === 'reconnecting'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-rose-500'
                }`}
              />
              <span className="capitalize hidden xs:inline">{connectionStatus}</span>
            </div>
          </div>
        </div>
      )}

      {/* In-App Leave Party Confirmation Modal */}
      <ConfirmModal
        isOpen={showLeaveModal}
        title="Leave Party?"
        description="Are you sure you want to leave this party? You will be disconnected and returned to the main screen."
        confirmText="Leave Party"
        cancelText="Stay in Party"
        variant="danger"
        icon={<LogOut className="h-6 w-6" />}
        onConfirm={handleConfirmLeave}
        onClose={() => setShowLeaveModal(false)}
      />
    </header>
  );
};

