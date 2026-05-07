import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Play, Trophy, Users } from 'lucide-react';
import Heading from '@/components/heading';
import WheelDrawModal from '@/components/draw/wheel-draw-modal';
import WinnerCelebration from '@/components/draw/winner-celebration';
import SomitiSectionNav from '@/components/somiti-section-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import somitis from '@/routes/somitis';
import type { BreadcrumbItem } from '@/types';

type Draw = {
    id: number;
    month: string;
    pot_amount: number;
    seed: string;
    winner: { id: number; name: string };
    entrants: { member: { id: number; name: string }; position: number | null }[];
};

export default function DrawsShow({
    somiti,
    draw,
}: {
    somiti: {
        id: number;
        name: string;
        currency: string;
        monthly_amount: number | null;
        spin_sound_url: string;
        celebration_sound_url: string;
    };
    draw: Draw;
}) {
    const [celebrate, setCelebrate] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [wheelOpen, setWheelOpen] = useState(false);

    // Safety: if the shuffle timer is interrupted (tab inactive / HMR),
    // still reveal the persisted winner and celebrate.
    useEffect(() => {
        setRevealed(false);
        setCelebrate(false);
        setWheelOpen(false);

        const shouldWheel =
            typeof window !== 'undefined' &&
            new URLSearchParams(window.location.search).get('wheel') === '1';
        if (shouldWheel) {
            setWheelOpen(true);
        }

        if (!shouldWheel) return;

        const t = window.setTimeout(() => {
            setRevealed(true);
            setCelebrate(true);
        }, 16_500);

        return () => window.clearTimeout(t);
    }, [draw.id]);

    const entrants = draw.entrants
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((e) => ({ id: e.member.id, name: e.member.name }));

    return (
        <>
            <Head title={`Draw: ${draw.month}`} />

            <WheelDrawModal
                open={wheelOpen}
                seed={draw.seed}
                month={draw.month}
                potAmount={draw.pot_amount}
                currency={somiti.currency}
                entrants={entrants}
                winnerId={draw.winner.id}
                spinSoundUrl={somiti.spin_sound_url}
                onFinished={() => {
                    setRevealed(true);
                    setCelebrate(true);
                }}
                onOpenChange={setWheelOpen}
            />

            <WinnerCelebration
                open={celebrate}
                month={draw.month}
                winnerName={draw.winner.name}
                amount={draw.pot_amount}
                currency={somiti.currency}
                soundUrl={somiti.celebration_sound_url}
                onClose={() => setCelebrate(false)}
            />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title={`Draw result`}
                        description={`Month: ${draw.month}`}
                    />
                    <div className="sm:mt-1">
                        <SomitiSectionNav somiti={somiti} active="draws" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href={somitis.draws.run({ somiti: somiti.id, query: { month: draw.month } }).url}>
                                <Play className="mr-2 size-4" />
                                Run another month
                            </Link>
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (!confirm('Delete this draw history? This cannot be undone.')) return;
                                router.delete(somitis.draws.destroy({ somiti: somiti.id, draw: draw.id }).url);
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="gap-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-center gap-2">
                                <Trophy className="size-5 text-primary" />
                                <CardTitle className="text-base">
                                    Winner
                                </CardTitle>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">Month: {draw.month}</Badge>
                                <Badge variant="secondary">
                                    Pot: {draw.pot_amount} {somiti.currency}
                                </Badge>
                            </div>
                        </div>
                        <div className="text-xl font-semibold tracking-tight">
                            {draw.winner.name}
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="gap-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="size-5 text-muted-foreground" />
                                <CardTitle>Participants</CardTitle>
                                <Badge variant="secondary">{entrants.length}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">
                                    Pot: {draw.pot_amount} {somiti.currency}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-hidden rounded-xl border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/40 text-muted-foreground">
                                    <tr>
                                        <th className="w-12 px-4 py-3 text-left font-medium">#</th>
                                        <th className="px-4 py-3 text-left font-medium">Member</th>
                                        <th className="w-28 px-4 py-3 text-right font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {entrants.map((e, idx) => {
                                        const isWinner = e.id === draw.winner.id;
                                        return (
                                            <tr
                                                key={e.id}
                                                className={
                                                    isWinner
                                                        ? 'bg-primary/10'
                                                        : 'hover:bg-muted/30'
                                                }
                                            >
                                                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="truncate font-medium">
                                                            {e.name}
                                                        </div>
                                                        {isWinner ? (
                                                            <Badge variant="secondary">
                                                                Winner
                                                            </Badge>
                                                        ) : null}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {isWinner ? (
                                                        <Badge>Winner</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

DrawsShow.layout = {
    breadcrumbs: [
        { title: 'Somitis', href: somitis.index().url },
        { title: 'Draws', href: '#' },
        { title: 'Result', href: '#' },
    ] satisfies BreadcrumbItem[],
};

