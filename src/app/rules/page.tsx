import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { CHARACTER_DESCRIPTIONS, CHARACTER_COLORS } from '@/lib/engine/constants';
import { CharacterName } from '@/lib/engine/types';

const characters: CharacterName[] = ['เจ้าพยา', 'นักฆ่า', 'จอมโจร', 'ทูต', 'รัชทายาท'];

export default function RulesPage() {
  return (
    <main
      className="min-h-screen p-6"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a1220 0%, #0a0a0f 60%)' }}
    >
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors text-sm mb-6">
          <ChevronLeft className="w-4 h-4" />
          กลับ
        </Link>

        <h1 className="font-cinzel text-4xl font-bold text-yellow-400 mb-2">วิธีเล่น</h1>
        <p className="text-gray-500 text-sm mb-10">คู่มือครบถ้วนสำหรับ COUP</p>

        {/* Overview */}
        <section className="mb-10">
          <h2 className="text-white font-bold text-xl mb-3 font-cinzel">ภาพรวม</h2>
          <div className="bg-gray-900/50 border border-white/8 rounded-xl p-5 text-gray-300 text-sm leading-relaxed space-y-2">
            <p>COUP คือเกมแห่งการหลอกลวงและอนุมานทางสังคมสำหรับ 2-6 ผู้เล่น</p>
            <p>ผู้เล่นแต่ละคนเริ่มต้นด้วย 2 เหรียญและไพ่อิทธิพล 2 ใบที่ซ่อนอยู่ คุณสามารถอ้างตัวเป็นตัวละครใดก็ได้ — แม้ว่าคุณจะไม่มีก็ตาม</p>
            <p>ผู้เล่นคนอื่นสามารถท้าทายคำอ้างของคุณหรือสกัดการกระทำของคุณ หากเสียไพ่อิทธิพลทั้งหมดจะถูกคัดออก</p>
            <p className="font-semibold text-white">ผู้เล่นคนสุดท้ายที่มีอิทธิพลเหลืออยู่คือผู้ชนะ</p>
          </div>
        </section>

        {/* Characters */}
        <section className="mb-10">
          <h2 className="text-white font-bold text-xl mb-4 font-cinzel">ตัวละคร</h2>
          <div className="space-y-3">
            {characters.map(char => {
              const color = CHARACTER_COLORS[char];
              return (
                <div
                  key={char}
                  className="flex gap-4 p-4 rounded-xl border"
                  style={{ borderColor: `${color}30`, background: `${color}08` }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold font-cinzel text-lg flex-shrink-0"
                    style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
                  >
                    {char[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm mb-0.5" style={{ color }}>
                      {char}
                    </div>
                    <div className="text-gray-400 text-xs">{CHARACTER_DESCRIPTIONS[char]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Actions */}
        <section className="mb-10">
          <h2 className="text-white font-bold text-xl mb-4 font-cinzel">การกระทำ</h2>
          <div className="space-y-2 text-sm">
            {[
              { name: 'รายได้', desc: 'รับ 1 เหรียญ ไม่สามารถสกัดหรือท้าทายได้', cost: '' },
              { name: 'ความช่วยเหลือต่างประเทศ', desc: 'รับ 2 เหรียญ สามารถถูกดยุคสกัดได้', cost: '' },
              { name: 'รัฐประหาร', desc: 'จ่าย 7 เหรียญเพื่อกำจัดอิทธิพลของผู้เล่น ไม่สามารถสกัดได้', cost: '7' },
              { name: 'เก็บภาษี', desc: 'อ้างเป็นดยุค: รับ 3 เหรียญ สามารถถูกท้าทายได้', cost: '' },
              { name: 'ขโมย', desc: 'อ้างเป็นกัปตัน: ขโมย 2 เหรียญจากผู้เล่นอื่น สามารถถูกท้าทายหรือสกัดโดยกัปตัน/เอกอัครราชทูตได้', cost: '' },
              { name: 'ลอบสังหาร', desc: 'อ้างเป็นนักฆ่า: จ่าย 3 เหรียญเพื่อให้ผู้เล่นเสียอิทธิพล สามารถถูกท้าทายหรือสกัดโดยกงเตสซาได้', cost: '3' },
              { name: 'แลกไพ่', desc: 'อ้างเป็นเอกอัครราชทูต: จั่ว 2 ใบ เก็บ 2 ใบ คืนส่วนที่เหลือ สามารถถูกท้าทายได้', cost: '' },
            ].map(action => (
              <div key={action.name} className="flex gap-3 p-3 rounded-lg bg-gray-900/40 border border-white/5">
                <div className="flex-1">
                  <span className="text-white font-semibold text-xs">{action.name}</span>
                  {action.cost && (
                    <span className="ml-2 text-xs text-red-400 font-bold">(-{action.cost} เหรียญ)</span>
                  )}
                  <p className="text-gray-500 text-xs mt-0.5">{action.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Turn flow */}
        <section className="mb-10">
          <h2 className="text-white font-bold text-xl mb-4 font-cinzel">ลำดับการเล่น</h2>
          <div className="space-y-3">
            {[
              { step: '1', title: 'ประกาศการกระทำ', desc: 'เลือกการกระทำ คุณสามารถอ้างตัวเป็นตัวละครใดก็ได้' },
              { step: '2', title: 'ช่วงท้าทาย', desc: 'ผู้เล่นอื่นสามารถท้าทายคำอ้างตัวละครของคุณ หากถูกท้าทายและคุณไม่มีไพ่นั้น คุณเสียอิทธิพล หากมี ผู้ท้าทายเสียอิทธิพลและคุณได้ไพ่ใหม่' },
              { step: '3', title: 'ช่วงสกัด', desc: 'ผู้เล่นอื่นสามารถอ้างตัวเป็นตัวละครที่สกัดได้ ผู้สกัดสามารถถูกท้าทายได้เช่นกัน' },
              { step: '4', title: 'ผลการกระทำ', desc: 'หากไม่ถูกท้าทายหรือสกัด การกระทำจะมีผล' },
            ].map(item => (
              <div key={item.step} className="flex gap-4 p-4 rounded-xl bg-gray-900/40 border border-white/5">
                <div className="w-7 h-7 rounded-full bg-yellow-900/40 border border-yellow-500/40 flex items-center justify-center text-yellow-400 text-xs font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold mb-0.5">{item.title}</div>
                  <div className="text-gray-400 text-xs">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Win condition */}
        <section className="mb-10">
          <h2 className="text-white font-bold text-xl mb-3 font-cinzel">เงื่อนไขชนะ</h2>
          <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-5 text-sm text-gray-300">
            กำจัดผู้เล่นอื่นทั้งหมดโดยทำให้พวกเขาเสียไพ่อิทธิพลทั้งหมด
            หากคุณมี 10 เหรียญขึ้นไป คุณ <span className="text-white font-semibold">ต้อง</span> รัฐประหารในตาของคุณ
          </div>
        </section>

        <div className="text-center">
          <Link
            href="/setup"
            className="inline-block px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #d4a847 0%, #8b6e2a 100%)',
              color: '#0a0a0f',
              boxShadow: '0 4px 20px rgba(212,168,71,0.25)',
            }}
          >
            เล่นเลย
          </Link>
        </div>
      </div>
    </main>
  );
}
