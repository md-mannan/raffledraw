import { useEffect, useMemo, useRef, useState } from 'react';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ConfettiPiece = {
    id: string;
    left: number;
    size: number;
    delayMs: number;
    durationMs: number;
    hue: number;
    rotate: number;
    drift: number;
};

function makePieces(count: number): ConfettiPiece[] {
    const now = Date.now().toString(36);
    return Array.from({ length: count }).map((_, i) => {
        const left = Math.random() * 100;
        const size = 6 + Math.random() * 10;
        const delayMs = Math.floor(Math.random() * 450);
        const durationMs = 1600 + Math.floor(Math.random() * 900);
        const hue = Math.floor(Math.random() * 360);
        const rotate = Math.floor(Math.random() * 260 - 130);
        const drift = Math.floor(Math.random() * 140 - 70);

        return {
            id: `${now}-${i}`,
            left,
            size,
            delayMs,
            durationMs,
            hue,
            rotate,
            drift,
        };
    });
}

export default function WinnerCelebration({
    open,
    month,
    winnerName,
    amount,
    currency,
    soundUrl,
    onClose,
}: {
    open: boolean;
    month: string;
    winnerName: string;
    amount: number;
    currency: string;
    soundUrl: string;
    onClose: () => void;
}) {
    const [mounted, setMounted] = useState(false);
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
    const applauseRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!mounted) return;
        if (applauseRef.current) return;
        const a = new Audio(soundUrl);
        a.preload = 'auto';
        a.volume = 0.8;
        applauseRef.current = a;
    }, [mounted, soundUrl]);

    useEffect(() => {
        if (!mounted || !open) return;
        setPieces(makePieces(48));

        // Applause on celebration open
        const a = applauseRef.current;
        if (a) {
            try {
                a.currentTime = 0;
            } catch {}
            void a.play().catch(() => {
                // Autoplay policy may block; user gesture will be needed.
            });
        }

        const t = window.setTimeout(() => onClose(), 6500);
        return () => {
            window.clearTimeout(t);
            // Stop applause if celebration closes early
            if (a) {
                try {
                    a.pause();
                } catch {}
                try {
                    a.currentTime = 0;
                } catch {}
            }
        };
    }, [mounted, open, onClose]);

    // Keep close behavior independent from the wheel modal:
    // Esc should close celebration only (not the underlying Dialog).
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            e.preventDefault();
            e.stopPropagation();
            // @ts-expect-error - stopImmediatePropagation exists in browsers
            e.stopImmediatePropagation?.();
            onClose();
        };

        window.addEventListener('keydown', onKeyDown, true);
        return () => window.removeEventListener('keydown', onKeyDown, true);
    }, [open, onClose]);

    const formattedAmount = useMemo(() => {
        try {
            return new Intl.NumberFormat(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }).format(amount);
        } catch {
            return String(amount);
        }
    }, [amount]);

    if (!mounted || !open) return null;

    return (
        <div
            className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            onPointerDownCapture={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {pieces.map((p) => (
                    <span
                        key={p.id}
                        className="absolute top-[-12%] rounded-sm opacity-90"
                        style={{
                            left: `${p.left}%`,
                            width: `${p.size}px`,
                            height: `${Math.max(6, p.size * 0.55)}px`,
                            background: `hsl(${p.hue} 90% 65%)`,
                            transform: `rotate(${p.rotate}deg)`,
                            animationName: 'rd_confetti_drop',
                            animationDuration: `${p.durationMs}ms`,
                            animationDelay: `${p.delayMs}ms`,
                            animationTimingFunction: 'cubic-bezier(0.15, 0.7, 0.25, 1)',
                            animationIterationCount: 1,
                            animationFillMode: 'both',
                            // @ts-expect-error - CSS var for keyframes
                            ['--rd-drift' as any]: `${p.drift}px`,
                        }}
                    />
                ))}
            </div>

            <div
                className={cn(
                    'relative w-full max-w-xl overflow-hidden rounded-2xl border bg-background shadow-2xl',
                    'animate-in fade-in zoom-in-95 duration-300',
                )}
            >
                <div className="absolute inset-0 opacity-70 mask-[radial-gradient(circle_at_top,black,transparent_65%)]">
                    <div className="h-full w-full bg-[radial-gradient(circle_at_25%_20%,rgba(112,92,252,0.55),transparent_55%),radial-gradient(circle_at_75%_25%,rgba(34,211,238,0.30),transparent_55%),radial-gradient(circle_at_50%_90%,rgba(250,204,21,0.22),transparent_55%)]" />
                </div>

                <div className="relative p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                                <Trophy className="size-4" />
                                Winner declared
                            </div>

                            <div className="mt-4 text-sm text-muted-foreground">
                                Month: <span className="font-medium text-foreground">{month}</span>
                            </div>

                            <div className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                                {winnerName}
                            </div>

                            <div className="mt-4 rounded-xl border bg-card/70 p-4">
                                <div className="text-sm text-muted-foreground">
                                    Winning amount
                                </div>
                                <div className="mt-1 text-xl font-semibold">
                                    {formattedAmount} {currency}
                                </div>
                            </div>
                        </div>

                        <div className="pointer-events-auto">
                            <Button variant="outline" onClick={onClose}>
                                Close
                            </Button>
                        </div>
                    </div>

                    <div className="pointer-events-auto mt-6 flex flex-wrap gap-2">
                        <Button onClick={() => setPieces(makePieces(56))}>
                            Celebrate again
                        </Button>
                        <Button variant="secondary" onClick={onClose}>
                            Continue
                        </Button>
                    </div>
                </div>
            </div>

            <style>{`
@keyframes rd_confetti_drop {
  0% { transform: translate3d(0, -30vh, 0) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translate3d(var(--rd-drift), 120vh, 0) rotate(720deg); opacity: 0.95; }
}
            `}</style>
        </div>
    );
}

