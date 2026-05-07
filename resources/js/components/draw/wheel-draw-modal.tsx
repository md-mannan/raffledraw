import { useEffect, useMemo, useRef, useState } from 'react';
import { Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type Entrant = { id: number; name: string };

function hashToInt(seed: string) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function buildGradient(n: number, offsetDeg: number) {
    const safe = Math.max(1, n);
    const step = 360 / safe;
    const stops: string[] = [];

    for (let i = 0; i < safe; i++) {
        const start = i * step;
        const end = (i + 1) * step;
        // Golden-angle hues avoid adjacent repeats and feel "premium".
        const hue = (i * 137.508) % 360;
        const light = i % 2 === 0 ? 58 : 52;
        const color = `hsl(${hue} 88% ${light}%)`;
        stops.push(`${color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`);
    }

    // Put segment centers under the top pointer.
    // Conic gradients start at 3 o'clock; offset aligns segment centers at 12 o'clock.
    return `conic-gradient(from ${offsetDeg}deg, ${stops.join(', ')})`;
}

export default function WheelDrawModal({
    open,
    seed,
    month,
    potAmount,
    currency,
    entrants,
    winnerId,
    spinSoundUrl,
    onFinished,
    onOpenChange,
}: {
    open: boolean;
    seed: string;
    month: string;
    potAmount: number;
    currency: string;
    entrants: Entrant[];
    winnerId: number;
    spinSoundUrl: string | null;
    onFinished: () => void;
    onOpenChange: (v: boolean) => void;
}) {
    const [phase, setPhase] = useState<'idle' | 'spinning' | 'done'>('idle');
    const [rotation, setRotation] = useState(0);
    const finishedRef = useRef(false);
    const wheelRef = useRef<HTMLDivElement | null>(null);
    const [labelRadius, setLabelRadius] = useState(165);

    const SPIN_MS = 15_000;

    // --- Sound ---
    // Spin uses an MP3 (user provided). Win keeps a lightweight WebAudio fanfare.
    const spinAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!open) return;
        if (spinAudioRef.current) return;
        if (!spinSoundUrl) return;
        const a = new Audio(spinSoundUrl);
        a.loop = true;
        a.preload = 'auto';
        a.volume = 0.5;
        spinAudioRef.current = a;
    }, [open, spinSoundUrl]);

    const startSpinSound = async () => {
        const a = spinAudioRef.current;
        if (!a) return;
        try {
            a.currentTime = 0;
        } catch {}
        try {
            await a.play();
        } catch {
            // Autoplay policy: user gesture needed.
        }
    };

    const stopSpinSound = () => {
        const a = spinAudioRef.current;
        if (!a) return;
        try {
            a.pause();
        } catch {}
        try {
            a.currentTime = 0;
        } catch {}
    };

    // Win fanfare (Web Audio; no external assets)
    const audioCtxRef = useRef<AudioContext | null>(null);
    const [audioUnlocked, setAudioUnlocked] = useState(false);

    const ensureAudio = async () => {
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new AudioContext();
            }
            if (audioCtxRef.current.state !== 'running') {
                await audioCtxRef.current.resume();
            }
            setAudioUnlocked(true);
        } catch {
            // Ignore audio failures (autoplay policy, etc.)
        }
    };

    const playWinSound = async () => {
        await ensureAudio();
        const ctx = audioCtxRef.current;
        if (!ctx || ctx.state !== 'running') return;

        const now = ctx.currentTime;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
        gain.connect(ctx.destination);

        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
        notes.forEach((freq, i) => {
            const o = ctx.createOscillator();
            o.type = 'sine';
            o.frequency.setValueAtTime(freq, now + i * 0.12);
            o.connect(gain);
            o.start(now + i * 0.12);
            o.stop(now + i * 0.12 + 0.28);
        });
    };

    const winnerIndex = useMemo(() => {
        return Math.max(
            0,
            entrants.findIndex((e) => e.id === winnerId),
        );
    }, [entrants, winnerId]);

    const segmentAngle = useMemo(() => {
        return 360 / Math.max(1, entrants.length);
    }, [entrants.length]);

    // Coordinate system:
    // - conic-gradient 0deg is at the TOP (pointer).
    // - we offset by -segment/2 so wedge centers land at i*segment (i=0 at top).
    const gradientOffset = useMemo(() => {
        return -segmentAngle / 2;
    }, [segmentAngle]);

    const bg = useMemo(
        () => buildGradient(entrants.length, gradientOffset),
        [entrants.length, gradientOffset],
    );

    const labelScale = useMemo(() => {
        // Keep labels within their wedge as participant count grows.
        // 45deg (8 people) => 1.0, 30deg (12 people) => ~0.72
        const s = segmentAngle / 45;
        return Math.min(1, Math.max(0.68, s));
    }, [segmentAngle]);

    const winnerName = useMemo(() => {
        return entrants.find((e) => e.id === winnerId)?.name ?? '—';
    }, [entrants, winnerId]);

    const finalRotation = useMemo(() => {
        const n = Math.max(1, entrants.length);
        const segment = 360 / n;
        // With our gradient offset, wedge centers are at: i*segment (i=0 at pointer).
        const centerAngle = winnerIndex * segment;
        const spins = 5 + (hashToInt(seed) % 3); // 5..7 spins
        return spins * 360 - centerAngle;
    }, [entrants.length, winnerIndex, seed]);

    useEffect(() => {
        if (!open) return;
        const el = wheelRef.current;
        if (!el) return;

        const ro = new ResizeObserver(() => {
            const rect = el.getBoundingClientRect();
            const size = Math.min(rect.width, rect.height);
            // Keep labels near mid-span of wedges (inside rim).
            setLabelRadius(Math.max(110, size / 2 - 64));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [open]);

    useEffect(() => {
        if (!open) return;
        finishedRef.current = false;
        setPhase('idle');
        setRotation(0);

        const t = window.setTimeout(() => {
            setPhase('spinning');
            setRotation(finalRotation);
        }, 250);

        return () => window.clearTimeout(t);
    }, [open, finalRotation]);

    useEffect(() => {
        if (!open) return;
        if (phase === 'spinning') {
            startSpinSound();
            return;
        }
        if (phase === 'done') {
            stopSpinSound();
        }
        if (phase === 'idle') {
            stopSpinSound();
        }
    }, [open, phase]);

    useEffect(() => {
        if (!open) return;
        if (phase !== 'spinning') return;

        const t = window.setTimeout(() => {
            setPhase('done');
            // Trigger celebration a beat after wheel stops.
            window.setTimeout(() => {
                if (!finishedRef.current) {
                    finishedRef.current = true;
                    playWinSound();
                    onFinished();
                }
            }, 1000);
        }, SPIN_MS + 250);

        return () => window.clearTimeout(t);
    }, [open, phase, onFinished]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[min(96vw,860px)] p-0 overflow-hidden">
                <div className="relative">
                    <div className="absolute inset-0 opacity-60 mask-[radial-gradient(circle_at_top,black,transparent_70%)]">
                        <div className="h-full w-full bg-[radial-gradient(circle_at_25%_20%,rgba(112,92,252,0.40),transparent_55%),radial-gradient(circle_at_75%_20%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_55%_90%,rgba(250,204,21,0.14),transparent_55%)]" />
                    </div>

                    <div className="relative p-6 sm:p-7">
                        <DialogHeader className="text-left">
                            <DialogTitle className="flex items-center gap-2">
                                <Trophy className="size-5 text-muted-foreground" />
                                Wheel draw
                            </DialogTitle>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="secondary">{month}</Badge>
                                <Badge variant="outline">
                                    Pot: {potAmount} {currency}
                                </Badge>
                                {phase === 'done' ? (
                                    <Badge>Winner: {winnerName}</Badge>
                                ) : (
                                    <Badge variant="outline">
                                        {phase === 'spinning'
                                            ? 'Spinning…'
                                            : 'Ready'}
                                    </Badge>
                                )}
                            </div>
                        </DialogHeader>

                        <div className="mt-6">
                            <div
                                className="relative grid place-items-center"
                                onPointerDown={() => {
                                    // Unlock both WebAudio + HTMLAudio autoplay.
                                    if (!audioUnlocked) void ensureAudio();
                                    void startSpinSound();
                                    stopSpinSound();
                                }}
                            >
                                <div className="pointer-events-none absolute -top-2 z-10">
                                    <div className="h-0 w-0 border-l-[12px] border-r-[12px] border-t-[22px] border-l-transparent border-r-transparent border-t-primary drop-shadow" />
                                </div>

                                <div
                                    className={cn(
                                        'relative size-[min(72vw,440px)] rounded-full border shadow-xl',
                                        'bg-muted/20',
                                    )}
                                    style={{ perspective: '1100px' }}
                                    ref={wheelRef}
                                >
                                    <div className="absolute inset-0 rounded-full shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)]" />

                                    {/* Rim / depth */}
                                    <div className="absolute inset-[6px] rounded-full bg-gradient-to-b from-white/70 to-black/10 opacity-70" />

                                    <div className="absolute inset-2 rounded-full border bg-background shadow-inner">
                                        <div
                                            className="absolute inset-0 rounded-full"
                                            style={{
                                                transform: `rotateX(18deg) rotate(${rotation}deg)`,
                                                transformStyle: 'preserve-3d',
                                                transition:
                                                    phase === 'spinning'
                                                        ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.8, 0.12, 1)`
                                                        : undefined,
                                                backgroundImage: bg,
                                            }}
                                        >
                                            {/* glossy highlight */}
                                            <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.55),transparent_55%)]" />

                                            {entrants.map((e, i) => {
                                                // Place names at the middle of each wedge span.
                                                const angle = i * segmentAngle;
                                                const needsFlip =
                                                    angle > 90 && angle < 270;
                                                const isWinner =
                                                    phase === 'done' &&
                                                    e.id === winnerId;

                                                // Align labels radially (same direction as the wedge),
                                                // and flip only when they're upside-down.
                                                const labelRotation = needsFlip ? 180 : 0;
                                                return (
                                                    <div
                                                        key={e.id}
                                                        className="absolute left-1/2 top-1/2"
                                                        style={{
                                                            width: 0,
                                                            height: 0,
                                                            transform: `translate(-50%, -50%) rotate(${angle}deg) translate(0,-${labelRadius}px)`,
                                                        }}
                                                    >
                                                        <div
                                                            className={cn(
                                                                'absolute left-0 top-0 rounded-lg bg-black/55 px-1 py-1.5 text-center text-[11px] font-medium text-white shadow-sm backdrop-blur',
                                                                isWinner &&
                                                                    'bg-primary/80',
                                                            )}
                                                            style={{
                                                                transform: `translate(-50%, -50%) rotate(${labelRotation}deg) scale(${labelScale})`,
                                                                transformOrigin: 'center',
                                                                writingMode:
                                                                    'vertical-rl',
                                                                textOrientation:
                                                                    'mixed',
                                                            }}
                                                            title={e.name}
                                                        >
                                                            {e.name.length >
                                                            14
                                                                ? `${e.name.slice(0, 14)}…`
                                                                : e.name}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="absolute inset-0 grid place-items-center">
                                        <div className="rounded-full border bg-background/85 px-5 py-3 text-center shadow-sm backdrop-blur">
                                            <div className="text-xs text-muted-foreground">
                                                {phase === 'done'
                                                    ? 'Winner'
                                                    : 'Drawing'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    finishedRef.current = false;
                                    setPhase('idle');
                                    setRotation(0);
                                    window.setTimeout(() => {
                                        setPhase('spinning');
                                        setRotation(finalRotation);
                                    }, 150);
                                }}
                            >
                                Spin again
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

