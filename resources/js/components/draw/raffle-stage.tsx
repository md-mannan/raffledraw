import { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Entrant = { id: number; name: string };

function hashToInt(seed: string) {
    // Simple deterministic hash (FNV-1a 32-bit).
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function mulberry32(a: number) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function RaffleStage({
    seed,
    entrants,
    winnerId,
    autoStart = true,
    revealWinner = false,
    onDone,
}: {
    seed: string;
    entrants: Entrant[];
    winnerId: number;
    autoStart?: boolean;
    revealWinner?: boolean;
    onDone?: () => void;
}) {
    const [phase, setPhase] = useState<'idle' | 'shuffle' | 'reveal' | 'done'>(
        'idle',
    );
    const [activeId, setActiveId] = useState<number | null>(null);
    const [ticks, setTicks] = useState(0);
    const intervalRef = useRef<number | null>(null);
    const doneCalledRef = useRef(false);

    const rng = useMemo(() => mulberry32(hashToInt(seed)), [seed]);
    const winner = useMemo(
        () => entrants.find((e) => e.id === winnerId) ?? null,
        [entrants, winnerId],
    );

    const start = () => {
        doneCalledRef.current = false;
        setPhase('shuffle');
        setTicks(0);
        setActiveId(null);
    };

    const reset = () => {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        doneCalledRef.current = false;
        setPhase('idle');
        setTicks(0);
        setActiveId(null);
    };

    const showWinner = () => {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        setTicks(0);
        setActiveId(winnerId);
        setPhase('done');
    };

    // Allow parent to force-reveal persisted winner (e.g. if timers are interrupted).
    useEffect(() => {
        if (!revealWinner) return;
        showWinner();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [revealWinner, winnerId]);

    useEffect(() => {
        if (phase !== 'done') return;
        if (doneCalledRef.current) return;
        doneCalledRef.current = true;
        onDone?.();
    }, [phase, onDone]);

    useEffect(() => {
        if (phase !== 'shuffle') return;

        const totalTicks = Math.min(120, 30 + entrants.length * 2);
        const base = 55;

        intervalRef.current = window.setInterval(() => {
            setTicks((t) => t + 1);
            const idx = Math.floor(rng() * Math.max(1, entrants.length));
            setActiveId(entrants[idx]?.id ?? null);
        }, base);

        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, entrants.length]);

    useEffect(() => {
        if (phase !== 'shuffle') return;

        const totalTicks = Math.min(120, 30 + entrants.length * 2);
        if (ticks < totalTicks) return;

        if (intervalRef.current) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        setPhase('reveal');

        const t = window.setTimeout(() => {
            setActiveId(winnerId);
            setPhase('done');
        }, 500);

        return () => window.clearTimeout(t);
    }, [phase, ticks, entrants.length, winnerId]);

    // Auto-start once mounted if we have entrants (optional).
    useEffect(() => {
        if (entrants.length === 0) return;
        if (!autoStart) {
            showWinner();
            return;
        }
        start();
        return () => reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seed, autoStart, entrants.map((e) => e.id).join(',')]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                    {entrants.length} eligible entrants
                </Badge>
                {phase === 'done' && winner ? (
                    <Badge>Winner: {winner.name}</Badge>
                ) : (
                    <Badge variant="outline">Drawing…</Badge>
                )}

                <div className="ml-auto flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => start()}
                        disabled={phase === 'shuffle'}
                    >
                        <RotateCcw className="mr-2 size-4" />
                        Replay
                    </Button>
                </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {entrants.map((e, idx) => {
                    const isActive = activeId === e.id;
                    const isWinner = phase === 'done' && e.id === winnerId;

                    const initials = e.name
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((p) => p[0]?.toUpperCase())
                        .join('');

                    return (
                        <div
                            key={e.id}
                            className={cn(
                                'group relative overflow-hidden rounded-xl border bg-card px-4 py-3 shadow-sm transition',
                                isActive && 'ring-ring/60 ring-2',
                                isWinner && 'ring-2 ring-primary',
                            )}
                        >
                            <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                                <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(112,92,252,0.10),transparent_55%),radial-gradient(circle_at_90%_30%,rgba(34,211,238,0.08),transparent_55%)]" />
                            </div>

                            <div className="relative flex items-center gap-3">
                                <div
                                    className={cn(
                                        'grid size-10 shrink-0 place-items-center rounded-lg border bg-muted/40 text-xs font-semibold text-muted-foreground',
                                        isWinner &&
                                            'border-primary/40 bg-primary/15 text-primary',
                                        isActive &&
                                            'border-ring/40 bg-ring/10 text-foreground',
                                    )}
                                >
                                    {initials || '#'}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="truncate font-medium">
                                            {e.name}
                                        </div>
                                        <span className="text-xs tabular-nums text-muted-foreground">
                                            #{idx + 1}
                                        </span>
                                    </div>

                                    <div className="mt-1 flex items-center gap-2">
                                        {isWinner ? (
                                            <Badge>Winner</Badge>
                                        ) : isActive ? (
                                            <Badge variant="secondary">
                                                Spotlight
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                —
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {phase === 'done' ? (
                <div className="relative overflow-hidden rounded-xl border bg-primary/10 p-6">
                    <div className="absolute inset-0 opacity-50 mask-[radial-gradient(circle_at_top,black,transparent_60%)]">
                        <div className="h-full w-full animate-in fade-in duration-500">
                            <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(112,92,252,0.35),transparent_50%),radial-gradient(circle_at_80%_30%,rgba(112,92,252,0.25),transparent_55%),radial-gradient(circle_at_50%_80%,rgba(112,92,252,0.18),transparent_55%)]" />
                        </div>
                    </div>
                    <div className="relative">
                        <div className="text-sm text-muted-foreground">
                            Congratulations
                        </div>
                        <div className="mt-1 text-xl font-semibold tracking-tight">
                            {winner?.name ?? '—'}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                            This result is replayable (seeded draw).
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

