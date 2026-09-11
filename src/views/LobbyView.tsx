import React, { useState } from 'react';
import { Play, Settings, Trophy, Users, Sparkles, AlertTriangle, ShieldCheck, Share2, Check, SlidersHorizontal } from 'lucide-react';
import { ClientPartyView, GameType, Player } from '../types.js';
import { AVAILABLE_GAMES } from '../data/games.js';
import { GameCard } from '../components/GameCard.js';
import { PlayerList } from '../components/PlayerList.js';
import { LobbyChat } from '../components/LobbyChat.js';
import { GameLaunchModal } from '../components/GameLaunchModal.js';
import { AvatarSelectorModal } from '../components/AvatarSelectorModal.js';
import { socketService } from '../services/socket.js';
import { soundService } from '../services/sound.js';

interface LobbyViewProps {
  party: ClientPartyView;
  onOpenHostControls: () => void;
  onOpenScoreboard: () => void;
  onToggleChat: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  party,
  onOpenHostControls,
  onOpenScoreboard,
  onToggleChat
}) => {
  const { code, name, isHost, currentGame, players, myPlayerId, hostId, gameSettings, chatMessages } = party;

  const [selectedGameForModal, setSelectedGameForModal] = useState<GameType | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const onlinePlayersCount = (Object.values(players) as Player[]).filter((p) => p.isOnline).length;
  const selectedGameMeta = AVAILABLE_GAMES.find((g) => g.id === currentGame) || AVAILABLE_GAMES[0];

  const minPlayersNeeded = selectedGameMeta.minPlayers;
  const canStart = onlinePlayersCount >= minPlayersNeeded;

  const myPlayer = players[myPlayerId] || { name: 'Player', avatar: '🎮', color: '#8B5CF6' };

  const handleSelectGame = (gameId: GameType) => {
    if (isHost) {
      socketService.selectGame(gameId);
      soundService.playClick();
    }
  };

  const handleOpenLaunchModal = (gameId?: GameType) => {
    const targetGame = gameId || selectedGameMeta.id;
    if (isHost) {
      if (currentGame !== targetGame) {
        socketService.selectGame(targetGame);
      }
      setSelectedGameForModal(targetGame);
      soundService.playClick();
    }
  };

  return (
    <div className="space-y-8">
      {/* 2-Column Responsive Layout: Games & Players (Left) + Real-time Lobby Chat (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Column (Left): Hero banner, Game Catalog, Players */}
        <div className="lg:col-span-8 space-y-8">
          {/* Selected Game Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-violet-500/40 bg-gradient-to-br from-violet-950/40 via-zinc-950 to-zinc-950 p-6 sm:p-7 backdrop-blur-xl shadow-2xl">
            {/* Ambient Background Blur */}
            <div
              className="absolute -top-24 -left-24 h-56 w-56 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: selectedGameMeta.accentColor }}
            />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4 sm:gap-5">
                <div
                  className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl sm:rounded-3xl text-3xl sm:text-4xl shadow-xl shadow-violet-600/20"
                  style={{
                    backgroundColor: `${selectedGameMeta.accentColor}20`,
                    border: `2px solid ${selectedGameMeta.accentColor}50`
                  }}
                >
                  <span>{selectedGameMeta.icon}</span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-violet-600/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-violet-300 border border-violet-500/30">
                      Selected Game
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">
                      {selectedGameMeta.id === 'wordle'
                        ? `${gameSettings.rounds} ${gameSettings.rounds === 1 ? 'Round' : 'Rounds'} • Untimed • `
                        : `${gameSettings.rounds} ${gameSettings.rounds === 1 ? 'Round' : 'Rounds'} • ${gameSettings.timeLimit}s timer • `}
                      <span className="capitalize">{gameSettings.difficulty}</span>
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1.5">
                    {selectedGameMeta.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl leading-relaxed">
                    {selectedGameMeta.tagline}
                  </p>
                </div>
              </div>

              {/* Action Button for Host / Waiting text for players */}
              <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
                {isHost ? (
                  <div className="w-full md:w-auto flex flex-col items-stretch sm:items-end gap-2">
                    <div className="flex w-full sm:w-auto items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenLaunchModal(selectedGameMeta.id)}
                        className="flex items-center justify-center gap-1.5 rounded-2xl bg-zinc-900 border border-zinc-700/80 px-4 py-3 text-xs font-bold text-zinc-200 hover:bg-zinc-800 hover:text-white transition cursor-pointer shrink-0"
                        title="Configure settings for this game before starting"
                      >
                        <SlidersHorizontal className="h-4 w-4 text-violet-400" />
                        <span>Settings</span>
                      </button>

                      <button
                        id="lobby-start-game-btn"
                        onClick={() => handleOpenLaunchModal(selectedGameMeta.id)}
                        disabled={!canStart}
                        className={`flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-2xl px-6 sm:px-7 py-3 text-sm font-black transition-all cursor-pointer ${
                          canStart
                            ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-xl shadow-violet-600/30 hover:scale-103 hover:from-violet-500 hover:to-pink-500'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        <Play className="h-4 w-4 fill-current" />
                        <span>START GAME</span>
                      </button>
                    </div>

                    {!canStart && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Requires min {minPlayersNeeded} players ({onlinePlayersCount}/{minPlayersNeeded})</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full md:w-auto rounded-2xl bg-zinc-900/80 px-5 py-3.5 text-center text-xs font-semibold text-zinc-400 border border-zinc-800/80">
                    <span className="flex items-center justify-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-ping"></span>
                      Waiting for Host to configure & start...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Game Selection Catalog Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Choose a Multiplayer Game</h3>
                <p className="text-xs text-zinc-400">
                  {isHost ? 'Select a game, customize its rules, and launch when ready' : 'Host can select games for the room'}
                </p>
              </div>

              {isHost && (
                <button
                  type="button"
                  onClick={onOpenHostControls}
                  className="flex items-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5 text-amber-400" />
                  <span>Host Panel</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVAILABLE_GAMES.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isSelected={game.id === selectedGameMeta.id}
                  isHost={isHost}
                  onSelect={() => handleSelectGame(game.id)}
                  playerCount={onlinePlayersCount}
                />
              ))}
            </div>
          </div>

          {/* Players in Room Grid with Avatar Customization */}
          <div className="space-y-4">
            <PlayerList
              players={players}
              hostId={hostId}
              myPlayerId={myPlayerId}
              isHost={isHost}
              onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
            />
          </div>
        </div>

        {/* Sidebar Column (Right): Embedded Real-Time Party Lobby Chat */}
        <div className="lg:col-span-4 sticky top-20">
          <LobbyChat
            messages={chatMessages}
            myPlayerId={myPlayerId}
          />
        </div>
      </div>

      {/* Host Game Launch & Specific Settings Modal */}
      {selectedGameForModal && (
        <GameLaunchModal
          isOpen={!!selectedGameForModal}
          onClose={() => setSelectedGameForModal(null)}
          gameType={selectedGameForModal}
          party={party}
        />
      )}

      {/* Avatar Customization Modal */}
      <AvatarSelectorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={myPlayer.avatar}
        playerName={myPlayer.name}
        playerColor={myPlayer.color}
      />
    </div>
  );
};
