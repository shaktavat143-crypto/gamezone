import React, { useState, useEffect } from 'react';
import { Gamepad2, Plus, Users, Sparkles, ArrowRight, Play, Trophy, ShieldCheck, Zap, RefreshCw, RotateCcw, LogIn } from 'lucide-react';
import { socketService } from '../services/socket.js';
import { soundService } from '../services/sound.js';
import { AVAILABLE_GAMES } from '../data/games.js';
import { DEFAULT_AVATARS, generateAvatarFromUsername } from '../utils/avatar.js';

interface HomeViewProps {
  initialJoinCode?: string;
  errorMessage?: string | null;
  onClearError: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  initialJoinCode,
  errorMessage,
  onClearError
}) => {
  const [modalMode, setModalMode] = useState<'create' | 'join' | 'rejoin' | null>(initialJoinCode ? 'join' : null);

  const [playerName, setPlayerName] = useState(() => localStorage.getItem('gamezone_player_name') || '');
  const [partyName, setPartyName] = useState('');
  const [partyCode, setPartyCode] = useState(initialJoinCode || '');
  const [rejoinCode, setRejoinCode] = useState(() => localStorage.getItem('gamezone_party_code') || '');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [isCustomAvatarSelected, setIsCustomAvatarSelected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localModalError, setLocalModalError] = useState<string | null>(null);

  const storedPartyCode = localStorage.getItem('gamezone_party_code');
  const storedPlayerName = localStorage.getItem('gamezone_player_name');

  useEffect(() => {
    if (initialJoinCode) {
      setPartyCode(initialJoinCode.toUpperCase());
      setModalMode('join');
    }
  }, [initialJoinCode]);

  // Reset submitting state if an error is received
  useEffect(() => {
    if (errorMessage) {
      setIsSubmitting(false);
    }
  }, [errorMessage]);

  const handleNameChange = (val: string) => {
    setPlayerName(val);
    setLocalModalError(null);
    if (!isCustomAvatarSelected && val.trim()) {
      setSelectedAvatar(generateAvatarFromUsername(val));
    }
  };

  const handleSelectAvatar = (av: string) => {
    setSelectedAvatar(av);
    setIsCustomAvatarSelected(true);
    soundService.playClick();
  };

  const handleRandomizeAvatar = () => {
    const random = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
    setSelectedAvatar(random);
    setIsCustomAvatarSelected(true);
    soundService.playClick();
  };

  const handleOpenModal = (mode: 'create' | 'join' | 'rejoin') => {
    soundService.playClick();
    setLocalModalError(null);
    onClearError();
    setModalMode(mode);
  };

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = playerName.trim() || 'Player';
    const cleanParty = partyName.trim() || `${cleanName}'s Party`;

    setIsSubmitting(true);
    setLocalModalError(null);
    onClearError();
    soundService.playClick();

    console.log('[HomeView.handleCreateParty] 🚀 User triggered party creation:', {
      playerName: cleanName,
      partyName: cleanParty,
      avatar: selectedAvatar
    });

    try {
      await socketService.createParty(cleanName, cleanParty, selectedAvatar);
      console.log('[HomeView.handleCreateParty] ✅ createParty call succeeded');
    } catch (err: any) {
      console.error('[HomeView.handleCreateParty] ❌ Caught error during party creation:', err);
      setLocalModalError(err.message || 'Failed to create party. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinParty = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = partyCode.trim().toUpperCase();
    if (!cleanCode) {
      setLocalModalError('Please enter the 6-letter room code');
      return;
    }
    const cleanName = playerName.trim() || 'Player';

    setIsSubmitting(true);
    setLocalModalError(null);
    onClearError();
    soundService.playClick();

    console.log('[HomeView.handleJoinParty] 🚀 User triggered party join:', {
      partyCode: cleanCode,
      playerName: cleanName,
      avatar: selectedAvatar
    });

    try {
      await socketService.joinParty(cleanCode, cleanName, selectedAvatar);
      console.log('[HomeView.handleJoinParty] ✅ joinParty call succeeded');
    } catch (err: any) {
      console.error('[HomeView.handleJoinParty] ❌ Caught error during party join:', err);
      setLocalModalError(err.message || 'Failed to join party. Please check the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejoinParty = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = (rejoinCode || partyCode).trim().toUpperCase();
    if (!code) {
      setLocalModalError('Please enter a valid room code to rejoin');
      return;
    }

    setIsSubmitting(true);
    setLocalModalError(null);
    onClearError();
    soundService.playClick();

    const storedToken = localStorage.getItem('gamezone_session_token') || undefined;
    const storedPlayerId = localStorage.getItem('gamezone_player_id') || undefined;
    const cleanName = playerName.trim() || storedPlayerName || 'Player';

    console.log('[HomeView.handleRejoinParty] 🚀 User triggered party rejoin:', {
      code,
      cleanName,
      storedPlayerId,
      hasToken: !!storedToken
    });

    try {
      await socketService.rejoinParty(code, cleanName, storedToken, storedPlayerId);
      console.log('[HomeView.handleRejoinParty] ✅ rejoinParty call succeeded');
    } catch (err: any) {
      console.error('[HomeView.handleRejoinParty] ❌ Caught error during party rejoin:', err);
      setLocalModalError(err.message || 'Could not rejoin room. Please verify the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRejoinStored = async () => {
    if (!storedPartyCode) return;
    setIsSubmitting(true);
    setLocalModalError(null);
    onClearError();
    soundService.playClick();

    const storedToken = localStorage.getItem('gamezone_session_token') || undefined;
    const storedPlayerId = localStorage.getItem('gamezone_player_id') || undefined;
    const cleanName = storedPlayerName || playerName || 'Player';

    console.log('[HomeView.handleQuickRejoinStored] 🚀 Quick rejoining stored session:', {
      storedPartyCode,
      cleanName,
      storedPlayerId
    });

    try {
      await socketService.rejoinParty(storedPartyCode, cleanName, storedToken, storedPlayerId);
    } catch (err: any) {
      console.error('[HomeView.handleQuickRejoinStored] ❌ Quick rejoin error:', err);
      // Remove dead stored code so banner disappears
      localStorage.removeItem('gamezone_party_code');
      localStorage.removeItem('gamezone_session_token');
      localStorage.removeItem('gamezone_player_id');
      onClearError();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-violet-600 selection:text-white">
      {/* Top Simple Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-md shadow-indigo-500/20">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-black tracking-tight text-lg">
              GAME<span className="text-violet-400">ZONE</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="nav-rejoin-party-btn"
              onClick={() => handleOpenModal('rejoin')}
              className="flex items-center gap-1 sm:gap-1.5 rounded-xl px-2.5 sm:px-3.5 py-2 text-xs font-bold text-amber-300 hover:text-amber-200 hover:bg-amber-950/30 border border-amber-500/30 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Rejoin<span className="hidden sm:inline"> Game</span></span>
            </button>
            <button
              id="nav-join-party-btn"
              onClick={() => handleOpenModal('join')}
              className="rounded-xl px-2.5 sm:px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
            >
              Join<span className="hidden sm:inline"> with Code</span>
            </button>
            <button
              id="nav-create-party-btn"
              onClick={() => handleOpenModal('create')}
              className="rounded-xl bg-violet-600 px-3 sm:px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 transition cursor-pointer shadow-md shadow-violet-600/20"
            >
              Create<span className="hidden sm:inline"> Party</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex-1 flex flex-col justify-center">
        {/* Error message banner if any */}
        {(errorMessage || localModalError) && !modalMode && (
          <div className="mb-6 mx-auto max-w-lg w-full rounded-2xl bg-rose-950/90 border border-rose-500/60 p-4 text-xs font-semibold text-rose-200 shadow-xl flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="text-rose-400 font-bold">⚠️</span>
              <span>{errorMessage || localModalError}</span>
            </div>
            <button onClick={() => { onClearError(); setLocalModalError(null); }} className="text-rose-400 hover:text-white ml-3 font-bold cursor-pointer">✕</button>
          </div>
        )}

        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-950/60 px-4 py-1.5 text-xs font-bold text-violet-300 border border-violet-800/40">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span>REAL-TIME MULTIPLAYER IN YOUR BROWSER</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-none">
            GAME <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-pink-400">ZONE</span>
          </h1>

          <p className="text-lg sm:text-xl font-medium text-zinc-300">
            &quot;Play. Compete. Have Fun.&quot;
          </p>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Create a private online game room for your friend group. Share a 6-letter party code, play 6 real-time party games, chat live, and rejoin ongoing games without losing score!
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              id="hero-create-party-btn"
              onClick={() => handleOpenModal('create')}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-violet-600/30 hover:scale-102 hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>CREATE PARTY</span>
            </button>

            <button
              id="hero-join-party-btn"
              onClick={() => handleOpenModal('join')}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-zinc-900 border border-zinc-800 px-7 py-4 text-sm font-black text-zinc-200 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
            >
              <Users className="h-4 w-4" />
              <span>JOIN PARTY</span>
            </button>

            <button
              id="hero-rejoin-party-btn"
              onClick={() => handleOpenModal('rejoin')}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-amber-950/40 border border-amber-500/40 px-7 py-4 text-sm font-black text-amber-300 hover:bg-amber-950/70 hover:border-amber-400 transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>REJOIN GAME</span>
            </button>
          </div>
        </div>

        {/* Feature Games Showcase Grid */}
        <div className="mt-14 sm:mt-16">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">6 Instant Multiplayer Games Included</h2>
              <p className="text-xs text-zinc-400">No installation or downloads required. Works on desktop, tablet & mobile.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_GAMES.map((game) => (
              <div
                key={game.id}
                className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all"
              >
                <div className="flex items-center gap-3.5 mb-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-xl shadow-inner group-hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: `${game.accentColor}15`,
                      border: `1px solid ${game.accentColor}40`
                    }}
                  >
                    <span>{game.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{game.title}</h3>
                    <span className="text-[11px] text-zinc-400">{game.minPlayers}–{game.maxPlayers} players • {game.estimatedTime}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {game.tagline}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-600">
        GAME ZONE • Private multiplayer party rooms with live chat, persistent scores, and real-time game engines.
      </footer>

      {/* CREATE PARTY MODAL */}
      {modalMode === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-violet-500/40 bg-zinc-950 p-6 sm:p-7 shadow-2xl">
            <button
              onClick={() => setModalMode(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600/20 border border-violet-500/40 text-violet-300">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Create a New Party</h3>
                <p className="text-xs text-zinc-400">You will become the Party Host 👑</p>
              </div>
            </div>

            {/* In-Modal Error Banner */}
            {(localModalError || errorMessage) && (
              <div className="mb-4 rounded-xl bg-rose-950/90 border border-rose-500/60 p-3 text-xs font-semibold text-rose-200 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">⚠️</span>
                  <span>{localModalError || errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setLocalModalError(null); onClearError(); }}
                  className="text-rose-400 hover:text-white font-bold cursor-pointer ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            <form onSubmit={handleCreateParty} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Your Player Name:
                </label>
                <input
                  id="create-player-name-input"
                  type="text"
                  required
                  value={playerName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Alex"
                  maxLength={20}
                  className="w-full rounded-xl bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 border border-zinc-800 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Party Name (Optional):
                </label>
                <input
                  id="create-party-name-input"
                  type="text"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="e.g. Friday Night Gaming"
                  maxLength={30}
                  className="w-full rounded-xl bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 border border-zinc-800 focus:border-violet-500 focus:outline-none"
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-zinc-300">
                    Choose Avatar:
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomizeAvatar}
                    className="flex items-center gap-1 text-[11px] font-semibold text-violet-400 hover:text-violet-300 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Randomize</span>
                  </button>
                </div>
                <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {DEFAULT_AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => handleSelectAvatar(av)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-base transition cursor-pointer ${
                        selectedAvatar === av
                          ? 'bg-violet-600 text-white ring-2 ring-violet-400 shadow-md scale-105'
                          : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="submit-create-party-btn"
                  type="submit"
                  disabled={!playerName.trim() || isSubmitting}
                  className="w-full rounded-xl bg-violet-600 py-3 text-xs font-bold text-white hover:bg-violet-500 disabled:opacity-50 transition cursor-pointer shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>CREATING PARTY...</span>
                    </>
                  ) : (
                    <span>CREATE PARTY 🎉</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN PARTY MODAL */}
      {modalMode === 'join' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-violet-500/40 bg-zinc-950 p-6 sm:p-7 shadow-2xl">
            <button
              onClick={() => setModalMode(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Join a Party</h3>
                <p className="text-xs text-zinc-400">Enter code shared by your friend</p>
              </div>
            </div>

            {/* In-Modal Error Banner */}
            {(localModalError || errorMessage) && (
              <div className="mb-4 rounded-xl bg-rose-950/90 border border-rose-500/60 p-3 text-xs font-semibold text-rose-200 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">⚠️</span>
                  <span>{localModalError || errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setLocalModalError(null); onClearError(); }}
                  className="text-rose-400 hover:text-white font-bold cursor-pointer ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            <form onSubmit={handleJoinParty} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Party Code:
                </label>
                <input
                  id="join-party-code-input"
                  type="text"
                  required
                  value={partyCode}
                  onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A7K29P"
                  maxLength={10}
                  className="w-full rounded-xl bg-zinc-900 px-3.5 py-2.5 text-base font-mono font-bold tracking-widest text-center text-violet-300 placeholder-zinc-600 border border-zinc-800 focus:border-violet-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Your Player Name:
                </label>
                <input
                  id="join-player-name-input"
                  type="text"
                  required
                  value={playerName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Maya"
                  maxLength={20}
                  className="w-full rounded-xl bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 border border-zinc-800 focus:border-violet-500 focus:outline-none"
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-zinc-300">
                    Choose Avatar:
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomizeAvatar}
                    className="flex items-center gap-1 text-[11px] font-semibold text-violet-400 hover:text-violet-300 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Randomize</span>
                  </button>
                </div>
                <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {DEFAULT_AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => handleSelectAvatar(av)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-base transition cursor-pointer ${
                        selectedAvatar === av
                          ? 'bg-violet-600 text-white ring-2 ring-violet-400 shadow-md scale-105'
                          : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="submit-join-party-btn"
                  type="submit"
                  disabled={!playerName.trim() || !partyCode.trim() || isSubmitting}
                  className="w-full rounded-xl bg-violet-600 py-3 text-xs font-bold text-white hover:bg-violet-500 disabled:opacity-50 transition cursor-pointer shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>JOINING PARTY...</span>
                    </>
                  ) : (
                    <span>JOIN PARTY 🚀</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJOIN PARTY MODAL */}
      {modalMode === 'rejoin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-amber-500/40 bg-zinc-950 p-6 sm:p-7 shadow-2xl">
            <button
              onClick={() => setModalMode(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Rejoin Party or Game</h3>
                <p className="text-xs text-zinc-400">Restore your player slot and scores</p>
              </div>
            </div>

            {/* In-Modal Error Banner */}
            {(localModalError || errorMessage) && (
              <div className="mb-4 rounded-xl bg-rose-950/90 border border-rose-500/60 p-3 text-xs font-semibold text-rose-200 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">⚠️</span>
                  <span>{localModalError || errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setLocalModalError(null); onClearError(); }}
                  className="text-rose-400 hover:text-white font-bold cursor-pointer ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            <p className="text-xs text-zinc-400 mb-4 bg-zinc-900/70 rounded-xl p-3 border border-zinc-800 leading-relaxed">
              Write or paste your 6-letter Room Code below. If you disconnected or reloaded, you will automatically recover your player state and current round data.
            </p>

            <form onSubmit={handleRejoinParty} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1.5">
                  Party / Room Code:
                </label>
                <input
                  id="rejoin-party-code-input"
                  type="text"
                  required
                  autoFocus
                  value={rejoinCode}
                  onChange={(e) => setRejoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A7K29P"
                  maxLength={10}
                  className="w-full rounded-xl bg-zinc-900 px-3.5 py-3 text-lg font-mono font-black tracking-widest text-center text-amber-300 placeholder-zinc-600 border border-amber-500/40 focus:border-amber-400 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Your Player Name (to match your slot):
                </label>
                <input
                  id="rejoin-player-name-input"
                  type="text"
                  value={playerName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Alex"
                  maxLength={20}
                  className="w-full rounded-xl bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 border border-zinc-800 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  id="submit-rejoin-party-btn"
                  type="submit"
                  disabled={!rejoinCode.trim() || isSubmitting}
                  className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 py-3.5 text-xs font-black text-zinc-950 disabled:opacity-50 transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>REJOINING GAME...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 fill-zinc-950" />
                      <span>REJOIN PARTY & RESTORE SESSION</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
