import React from 'react';
import { Crown } from 'lucide-react';

interface PlayerAvatarProps {
  avatar?: string;
  name?: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isHost?: boolean;
  isOnline?: boolean;
  showStatus?: boolean;
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  avatar,
  name = 'Player',
  color = '#8B5CF6',
  size = 'md',
  isHost = false,
  isOnline,
  showStatus = false,
  className = ''
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs rounded-lg',
    sm: 'h-8 w-8 text-sm rounded-xl',
    md: 'h-10 w-10 text-lg rounded-xl',
    lg: 'h-12 w-12 text-2xl rounded-2xl',
    xl: 'h-16 w-16 text-3xl rounded-3xl'
  };

  const crownSizeClasses = {
    xs: 'h-2 w-2 -top-1 -right-1 p-0.5',
    sm: 'h-3 w-3 -top-1 -right-1 p-0.5',
    md: 'h-4 w-4 -top-1.5 -right-1.5 p-0.5',
    lg: 'h-5 w-5 -top-1.5 -right-1.5 p-1',
    xl: 'h-6 w-6 -top-2 -right-2 p-1'
  };

  const statusSizeClasses = {
    xs: 'h-1.5 w-1.5 -bottom-0.5 -right-0.5 ring-1 ring-zinc-950',
    sm: 'h-2 w-2 -bottom-0.5 -right-0.5 ring-1.5 ring-zinc-950',
    md: 'h-2.5 w-2.5 -bottom-0.5 -right-0.5 ring-2 ring-zinc-950',
    lg: 'h-3 w-3 -bottom-0.5 -right-0.5 ring-2 ring-zinc-950',
    xl: 'h-3.5 w-3.5 -bottom-1 -right-1 ring-2 ring-zinc-950'
  };

  const displayAvatar = avatar || '🎮';

  return (
    <div className={`relative inline-flex shrink-0 items-center justify-center select-none shadow-inner ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${color}25`,
        border: `1.5px solid ${color}60`
      }}
      title={name}
    >
      <span className="leading-none">{displayAvatar}</span>

      {/* Host Crown */}
      {isHost && (
        <div
          className={`absolute flex items-center justify-center rounded-full bg-amber-400 text-zinc-950 shadow-sm ${crownSizeClasses[size]}`}
          title="Party Host"
        >
          <Crown className="h-full w-full fill-current stroke-1" />
        </div>
      )}

      {/* Status Dot */}
      {showStatus && isOnline !== undefined && (
        <span
          className={`absolute rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-zinc-600'} ${statusSizeClasses[size]}`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};
