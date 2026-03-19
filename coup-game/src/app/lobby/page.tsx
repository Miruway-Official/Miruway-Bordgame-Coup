'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Users, Hash, User } from 'lucide-react';
import { useMultiplayerStore } from '@/stores/multiplayer-store';
import { setPlayerName } from '@/lib/player-identity';

export default function LobbyPage() {
  const router = useRouter();
  const { createRoom, joinRoom, error } = useMultiplayerStore();

  // Create form
  const [createName, setCreateName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isCreating, setIsCreating] = useState(false);

  // Join form
  const [joinName, setJoinName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setIsCreating(true);
    try {
      setPlayerName(createName.trim());
      const code = await createRoom(createName.trim(), maxPlayers);
      router.push(`/lobby/${code}`);
    } catch {
      setIsCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!joinName.trim() || !joinCode.trim()) return;
    setIsJoining(true);
    setJoinError('');
    try {
      setPlayerName(joinName.trim());
      await joinRoom(joinCode.trim(), joinName.trim());
      router.push(`/lobby/${joinCode.trim().toUpperCase()}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to join room';
      setJoinError(msg);
      setIsJoining(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: 8,
    display: 'block',
  };

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--bg-1)',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: 'transparent',
    color: 'var(--text-primary)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    outline: 'none',
    border: 'none',
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg-0)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Back */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            marginBottom: 28,
          }}
        >
          <ChevronLeft size={16} />
          กลับ
        </Link>

        {/* Heading */}
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 36,
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.1,
            marginBottom: 4,
          }}
        >
          เล่นออนไลน์
        </div>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: 'var(--text-secondary)',
            marginBottom: 24,
          }}
        >
          เล่นกับเพื่อนแบบเรียลไทม์
        </div>

        {/* Error banner */}
        {error && (
          <div
            style={{
              marginBottom: 20,
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid oklch(35% 0.10 22)',
              background: 'oklch(12% 0.05 22)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: 'oklch(70% 0.15 22)',
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {/* Create Room panel */}
          <div
            style={{
              padding: '20px',
              borderRadius: 14,
              border: '1px solid var(--border)',
              background: 'var(--bg-1)',
            }}
          >
            {/* Panel header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Users size={15} color="var(--gold)" />
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                สร้างห้อง
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
              <div style={fieldStyle}>
                <User size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  value={createName}
                  onChange={e => setCreateName(e.target.value)}
                  placeholder="ชื่อของคุณ"
                  maxLength={20}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>ผู้เล่นสูงสุด ({maxPlayers})</label>
                <div style={{ display: 'flex', gap: 5 }}>
                  {[2, 3, 4, 5, 6].map(n => {
                    const isActive = maxPlayers === n;
                    return (
                      <button
                        key={n}
                        onClick={() => setMaxPlayers(n)}
                        style={{
                          flex: 1,
                          height: 32,
                          borderRadius: 6,
                          border: `1px solid ${isActive ? 'oklch(35% 0.08 82)' : 'var(--border)'}`,
                          background: isActive ? 'oklch(16% 0.04 82)' : 'transparent',
                          color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={isCreating || !createName.trim()}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 10,
                border: '1px solid var(--gold)',
                background: isCreating || !createName.trim() ? 'transparent' : 'oklch(16% 0.06 82)',
                color: isCreating || !createName.trim() ? 'var(--text-muted)' : 'var(--gold)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: isCreating || !createName.trim() ? 'not-allowed' : 'pointer',
                opacity: isCreating || !createName.trim() ? 0.5 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              {isCreating ? 'กำลังสร้าง...' : 'สร้างห้อง'}
            </button>
          </div>

          {/* Join Room panel */}
          <div
            style={{
              padding: '20px',
              borderRadius: 14,
              border: '1px solid var(--border)',
              background: 'var(--bg-1)',
            }}
          >
            {/* Panel header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Hash size={15} color="var(--captain)" />
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                เข้าร่วมห้อง
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
              <div style={fieldStyle}>
                <User size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  value={joinName}
                  onChange={e => setJoinName(e.target.value)}
                  placeholder="ชื่อของคุณ"
                  maxLength={20}
                  style={inputStyle}
                />
              </div>

              <div style={fieldStyle}>
                <Hash size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="รหัสห้อง (เช่น ALPHA7)"
                  maxLength={6}
                  style={{
                    ...inputStyle,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    fontFamily: "'DM Sans', monospace",
                  }}
                />
              </div>

              {joinError && (
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    color: 'var(--assassin)',
                  }}
                >
                  {joinError}
                </div>
              )}
            </div>

            <button
              onClick={handleJoin}
              disabled={isJoining || !joinName.trim() || joinCode.length !== 6}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 10,
                border: `1px solid var(--captain)`,
                background:
                  isJoining || !joinName.trim() || joinCode.length !== 6
                    ? 'transparent'
                    : 'oklch(13% 0.05 242)',
                color:
                  isJoining || !joinName.trim() || joinCode.length !== 6
                    ? 'var(--text-muted)'
                    : 'var(--captain)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor:
                  isJoining || !joinName.trim() || joinCode.length !== 6
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  isJoining || !joinName.trim() || joinCode.length !== 6 ? 0.5 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              {isJoining ? 'กำลังเข้าร่วม...' : 'เข้าร่วมห้อง'}
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            textAlign: 'center',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            color: 'var(--text-muted)',
          }}
        >
          ห้องจะหมดอายุหลังจากไม่มีกิจกรรม · รองรับสูงสุด 6 ผู้เล่น
        </div>
      </div>
    </main>
  );
}
