/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ClientPartyView, GameResultItem } from './types.js';
import { socketService } from './services/socket.js';
import { soundService } from './services/sound.js';
import { Navbar } from './components/Navbar.js';
import { ConnectionBanner } from './components/ConnectionBanner.js';
import { HomeView } from './views/HomeView.js';
import { LobbyView } from './views/LobbyView.js';
import { GameContainer } from './components/GameContainer.js';
import { PartyChat } from './components/PartyChat.js';
import { OverallScoreboardModal } from './components/OverallScoreboardModal.js';
import { HostControlModal } from './components/HostControlModal.js';
import { GameResultsModal } from './components/GameResultsModal.js';
import { WelcomeBackModal } from './components/WelcomeBackModal.js';

export default function App() {
  const [party, setParty] = useState<ClientPartyView | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'disconnected'>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Panels
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(false);
  const [isHostControlsOpen, setIsHostControlsOpen] = useState(false);
  const [gameResults, setGameResults] = useState<GameResultItem[] | null>(null);
  const [welcomeBackData, setWelcomeBackData] = useState<{
    gameName: string;
    round: number;
    totalRounds: number;
  } | null>(null);

  // Parse URL query parameter for party code (e.g. ?join=A8K29P or ?party=A8K29P)
  const [initialJoinCode, setInitialJoinCode] = useState<string | undefined>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('join') || params.get('party') || params.get('code');
      return code ? code.toUpperCase() : undefined;
    } catch {
      return undefined;
    }
  });

  useEffect(() => {
    // Connect WebSocket
    socketService.connect();

    // Subscribe to party state changes
    const unsubParty = socketService.subscribeParty((updatedParty) => {
      setParty(updatedParty);
      setErrorMessage(null);

      // Save credentials for seamless reconnection
      if (updatedParty) {
        localStorage.setItem('gamezone_party_code', updatedParty.code);
        localStorage.setItem('gamezone_player_id', updatedParty.myPlayerId);
        const me = updatedParty.players[updatedParty.myPlayerId];
        if (me?.sessionToken) {
          localStorage.setItem('gamezone_session_token', me.sessionToken);
        }
        if (me?.name) {
          localStorage.setItem('gamezone_player_name', me.name);
        }
      }
    });

    // Subscribe to connection status
    const unsubStatus = socketService.subscribeConnectionStatus((status) => {
      setConnectionStatus(status);
    });

    // Subscribe to game over results
    const unsubGameOver = socketService.subscribeGameOver((results) => {
      setGameResults(results);
    });

    // Subscribe to errors
    const unsubError = socketService.subscribeError((msg) => {
      setErrorMessage(msg);
      soundService.playError();
    });

    // Subscribe to reconnect events
    const unsubReconnect = socketService.subscribeReconnect((data) => {
      setWelcomeBackData(data);
      soundService.playWinner();
    });

    // Auto-attempt reconnection if stored session exists
    const storedCode = localStorage.getItem('gamezone_party_code');
    const storedToken = localStorage.getItem('gamezone_session_token');
    const storedPlayerId = localStorage.getItem('gamezone_player_id');

    if (storedCode && storedToken && storedPlayerId) {
      setTimeout(() => {
        socketService.reconnect(storedCode, storedToken, storedPlayerId);
      }, 300);
    }

    return () => {
      unsubParty();
      unsubStatus();
      unsubGameOver();
      unsubError();
      unsubReconnect();
    };
  }, []);

  const handleLeaveParty = () => {
    socketService.leaveParty();
    soundService.playClick();
    setParty(null);
    setGameResults(null);
    setWelcomeBackData(null);
    localStorage.removeItem('gamezone_party_code');
    localStorage.removeItem('gamezone_session_token');
  };

  const handleRetryConnection = () => {
    socketService.connect();
    const storedCode = localStorage.getItem('gamezone_party_code');
    const storedToken = localStorage.getItem('gamezone_session_token');
    const storedPlayerId = localStorage.getItem('gamezone_player_id');
    if (storedCode && storedToken && storedPlayerId) {
      socketService.reconnect(storedCode, storedToken, storedPlayerId);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-violet-600 selection:text-white flex flex-col">
      {/* Top Reconnection / Connection Status Alert Banner */}
      <ConnectionBanner
        status={connectionStatus}
        onRetry={handleRetryConnection}
      />

      {/* Main Top Navigation Header */}
      <Navbar
        party={party}
        onOpenScoreboard={() => setIsScoreboardOpen(true)}
        onOpenHostControls={() => setIsHostControlsOpen(true)}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        onLeaveParty={handleLeaveParty}
        isChatOpen={isChatOpen}
        unreadChatCount={0}
      />

      {/* Main Screen Router */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {!party ? (
          <HomeView
            initialJoinCode={initialJoinCode}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage(null)}
          />
        ) : party.gameStatus === 'lobby' ? (
          <LobbyView
            party={party}
            onOpenHostControls={() => setIsHostControlsOpen(true)}
            onOpenScoreboard={() => setIsScoreboardOpen(true)}
            onToggleChat={() => setIsChatOpen((prev) => !prev)}
          />
        ) : (
          <GameContainer party={party} />
        )}
      </main>

      {/* Persistent Party Chat Drawer */}
      {party && (
        <PartyChat
          messages={party.chatMessages}
          myPlayerId={party.myPlayerId}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* Overall Scoreboard Modal */}
      {party && (
        <OverallScoreboardModal
          isOpen={isScoreboardOpen}
          onClose={() => setIsScoreboardOpen(false)}
          players={party.players}
          myPlayerId={party.myPlayerId}
        />
      )}

      {/* Host Controls Modal */}
      {party && party.isHost && (
        <HostControlModal
          isOpen={isHostControlsOpen}
          onClose={() => setIsHostControlsOpen(false)}
          isLocked={party.isLocked}
          gameSettings={party.gameSettings}
          players={party.players}
          myPlayerId={party.myPlayerId}
          gameStatus={party.gameStatus}
        />
      )}

      {/* Game Results Modal */}
      {party && (
        <GameResultsModal
          gameResults={gameResults}
          currentGame={party.currentGame}
          isHost={party.isHost}
          myPlayerId={party.myPlayerId}
          onChooseAnotherGame={() => {
            setGameResults(null);
            socketService.returnToLobby();
          }}
        />
      )}

      {/* Welcome Back Reconnected Modal */}
      {welcomeBackData && (
        <WelcomeBackModal
          playerName={party?.players[party.myPlayerId]?.name || 'Player'}
          reconnectData={welcomeBackData}
          onDismiss={() => setWelcomeBackData(null)}
        />
      )}
    </div>
  );
}
