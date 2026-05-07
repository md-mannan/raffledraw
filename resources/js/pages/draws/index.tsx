import { Head, Link } from '@inertiajs/react';
import { Calendar, Play, Trophy } from 'lucide-react';
import Heading from '@/components/heading';
import SomitiSectionNav from '@/components/somiti-section-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import somitis from '@/routes/somitis';
import type { BreadcrumbItem } from '@/types';

type DrawRow = {
    id: number;
    month: string;
    pot_amount: number;
    winner: { id: number; name: string } | null;
    created_at: string | null;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

export default function DrawsIndex({
    somiti,
    draws: paginated,
}: {
    somiti: { id: number; name: string; currency: string; monthly_amount: string | null };
    draws: {
        data?: DrawRow[];
        links?: PaginationLink[];
        meta?: { total: number };
        total?: number;
    };
}) {
    const rows = paginated.data ?? [];
    const total = paginated.meta?.total ?? paginated.total ?? rows.length;

    return (
        <>
            <Head title="Draws" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title={`${somiti.name} · Draws`}
                        description="Monthly raffle results and history"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <SomitiSectionNav somiti={somiti} active="draws" />
                        <Button asChild>
                            <Link href={somitis.draws.run(somiti).url} prefetch>
                                <Play className="mr-2 size-4" />
                                Run draw
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Trophy className="size-5 text-muted-foreground" />
                            <CardTitle>History</CardTitle>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {total} total
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y rounded-lg border">
                            {rows.length === 0 ? (
                                <div className="p-6 text-sm text-muted-foreground">
                                    No draws yet.
                                </div>
                            ) : (
                                rows.map((d) => (
                                    <Link
                                        key={d.id}
                                        href={
                                            somitis.draws.show({
                                                somiti: somiti.id,
                                                draw: d.id,
                                            }).url
                                        }
                                        className="flex flex-col gap-2 p-4 transition-colors hover:bg-muted/50 md:flex-row md:items-center md:justify-between"
                                        prefetch
                                    >
                                        <div className="flex items-center gap-2">
                                            <Calendar className="size-4 text-muted-foreground" />
                                            <div className="font-medium">
                                                {d.month}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="secondary">
                                                Pot: {d.pot_amount}
                                            </Badge>
                                            <Badge>
                                                Winner:{' '}
                                                {d.winner?.name ?? '—'}
                                            </Badge>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {paginated.links?.map((l) => (
                                <Button
                                    key={l.label}
                                    variant={l.active ? 'default' : 'outline'}
                                    size="sm"
                                    asChild
                                    disabled={!l.url}
                                >
                                    <a
                                        href={l.url ?? '#'}
                                        dangerouslySetInnerHTML={{
                                            __html: l.label,
                                        }}
                                    />
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

DrawsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Draws',
            href: somitis.index().url,
        },
    ] satisfies BreadcrumbItem[],
};

