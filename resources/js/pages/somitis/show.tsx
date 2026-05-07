import { Head, Link } from '@inertiajs/react';
import { Calendar, Coins, Pencil, Sparkles, Trophy, Users } from 'lucide-react';
import Heading from '@/components/heading';
import SomitiSectionNav from '@/components/somiti-section-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import somitis from '@/routes/somitis';
import type { BreadcrumbItem } from '@/types';

export default function SomitiShow({
    somiti,
    stats,
}: {
    somiti: { id: number; name: string; currency: string; monthly_amount: string | null };
    stats: {
        month: string;
        members_total: number;
        members_active: number;
        paid: number;
        unpaid: number;
        collected_amount: number;
        last_draw: { id: number; month: string | null; winner_name: string | null; pot_amount: number } | null;
    };
}) {
    return (
        <>
            <Head title={somiti.name} />
            <div className="space-y-6 p-4 md:p-6">
                <div className="relative overflow-hidden rounded-2xl border bg-card">
                    <div className="absolute inset-0 opacity-70 mask-[radial-gradient(circle_at_top,black,transparent_70%)]">
                        <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(112,92,252,0.18),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(34,211,238,0.12),transparent_55%),radial-gradient(circle_at_50%_95%,rgba(250,204,21,0.10),transparent_55%)]" />
                    </div>
                    <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="gap-1.5">
                                    <Sparkles className="size-3.5" />
                                    Somiti
                                </Badge>
                                <Badge variant="outline">{somiti.currency}</Badge>
                                <Badge variant="outline" className="gap-1.5">
                                    <Calendar className="size-3.5" />
                                    {stats.month}
                                </Badge>
                            </div>
                            <Heading
                                title={somiti.name}
                                description="Overview, monthly progress, and quick actions."
                            />
                            <div className="mt-4">
                                <SomitiSectionNav somiti={somiti} active="overview" />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline">
                                <Link href={somitis.edit(somiti.id).url} prefetch>
                                    <Pencil className="mr-2 size-4" />
                                    Edit settings
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={somitis.draws.run(somiti).url} prefetch>
                                    <Trophy className="mr-2 size-4" />
                                    Run draw
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-base">Members</CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="text-2xl font-semibold">
                                {stats.members_active}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Active (total {stats.members_total})
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-base">Collected</CardTitle>
                            <Coins className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="text-2xl font-semibold">
                                {stats.collected_amount} {somiti.currency}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                For {stats.month}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-base">Paid</CardTitle>
                            <Badge variant="secondary">{stats.paid}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="text-xs text-muted-foreground">
                                Members marked paid this month
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-base">Unpaid</CardTitle>
                            <Badge variant="outline">{stats.unpaid}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="text-xs text-muted-foreground">
                                Still pending for {stats.month}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle>Quick actions</CardTitle>
                            <Badge variant="secondary">
                                Monthly: {somiti.monthly_amount ?? 'Not set'}
                            </Badge>
                        </CardHeader>
                        <CardContent className="grid gap-3 sm:grid-cols-3">
                            <Button asChild variant="outline" className="justify-between">
                                <Link href={somitis.members.index(somiti).url} prefetch>
                                    <span className="flex items-center gap-2">
                                        <Users className="size-4" />
                                        Members
                                    </span>
                                    <span>Open</span>
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-between">
                                <Link href={somitis.contributions.index(somiti).url} prefetch>
                                    <span className="flex items-center gap-2">
                                        <Coins className="size-4" />
                                        Contributions
                                    </span>
                                    <span>Open</span>
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-between">
                                <Link href={somitis.draws.index(somiti).url} prefetch>
                                    <span className="flex items-center gap-2">
                                        <Trophy className="size-4" />
                                        Draw history
                                    </span>
                                    <span>Open</span>
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Last draw</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {stats.last_draw ? (
                                <>
                                    <div className="text-sm text-muted-foreground">
                                        Month: <span className="font-medium text-foreground">{stats.last_draw.month ?? '—'}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Winner: <span className="font-medium text-foreground">{stats.last_draw.winner_name ?? '—'}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Pot: <span className="font-medium text-foreground">{stats.last_draw.pot_amount} {somiti.currency}</span>
                                    </div>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link
                                            href={somitis.draws.show({ somiti: somiti.id, draw: stats.last_draw.id }).url}
                                            prefetch
                                        >
                                            View result
                                        </Link>
                                    </Button>
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    No draw yet. Mark contributions paid and run a draw for {stats.month}.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

SomitiShow.layout = {
    breadcrumbs: [
        { title: 'Somitis', href: somitis.index().url },
    ] satisfies BreadcrumbItem[],
};

