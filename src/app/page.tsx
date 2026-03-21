import Link from 'next/link';
import { CHARACTER_DESCRIPTIONS, CHARACTER_COLORS } from '@/lib/engine/constants';
import { CharacterName } from '@/lib/engine/types';

const characters: CharacterName[] = ['เจ้าพยา', 'นักฆ่า', 'จอมโจร', 'ทูต', 'รัชทายาท'];

// Resolve character initial for display
const CHAR_INITIAL: Record<CharacterName, string> = {
  'เจ้าพยา': 'พ',
  'นักฆ่า': 'น',
  'จอมโจร': 'จ',
  'ทูต': 'ท',
  'รัชทายาท': 'ร',
};

export default function HomePage() {
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
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 480 }}>
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--gold-dim)',
            marginBottom: 12,
          }}
        >
          เกมแห่งการหลอกลวงและอำนาจ
        </div>

        {/* Big COUP title */}
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(72px, 18vw, 96px)',
            fontWeight: 700,
            lineHeight: 0.9,
            color: 'var(--gold)',
            letterSpacing: '-0.02em',
            marginBottom: 20,
          }}
        >
          COUP
        </h1>

        {/* Thin rule */}
        <div
          style={{
            width: 48,
            height: 1,
            background: 'var(--border)',
            margin: '0 auto 20px',
          }}
        />

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            marginBottom: 32,
          }}
        >
          โกหก ท้าทาย และกำจัดคู่ต่อสู้
          <br />
          มีเพียงหนึ่งเดียวที่จะครองอำนาจ
        </p>

        {/* CTA buttons */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/lobby"
            style={{
              padding: '14px 28px',
              borderRadius: 10,
              background: 'var(--gold)',
              color: 'var(--bg-0)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.02em',
              textDecoration: 'none',
              transition: 'opacity 0.15s ease',
            }}
          >
            เล่นออนไลน์
          </Link>
          <Link
            href="/rules"
            style={{
              padding: '14px 28px',
              borderRadius: 10,
              border: '1px solid var(--border-subtle)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 400,
              textDecoration: 'none',
            }}
          >
            วิธีเล่น
          </Link>
        </div>
      </div>

      {/* Character cards row */}
      <div style={{ width: '100%', maxWidth: 600 }}>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginBottom: 14,
          }}
        >
          ตัวละคร
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {characters.map(char => {
            const color = CHARACTER_COLORS[char];
            return (
              <div
                key={char}
                style={{
                  width: 100,
                  padding: '14px 10px',
                  borderRadius: 10,
                  border: `1px solid ${color}30`,
                  background: `linear-gradient(175deg, ${color}14 0%, transparent 70%)`,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {/* Big initial */}
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 28,
                    fontWeight: 700,
                    color: color,
                    lineHeight: 1,
                  }}
                >
                  {CHAR_INITIAL[char]}
                </div>
                {/* Name */}
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {char}
                </div>
                {/* Description */}
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    lineHeight: 1.4,
                  }}
                >
                  {CHARACTER_DESCRIPTIONS[char]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer note */}
      <div
        style={{
          marginTop: 40,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.05em',
        }}
      >
        2–6 ผู้เล่น · การโกหก · กลยุทธ์
      </div>
    </main>
  );
}
