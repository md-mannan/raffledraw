import { Head, Link } from '@inertiajs/react';
import { BarChart3, Building2, Plus, Trophy, Users } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import * as somitis from '@/routes/somitis';

type AdminProps = {
    mode: 'admin';
    stats: { somitis: number; members: number; draws: number };
    somitis: {
        id: number;
        name: string;
        currency: string;
        monthly_amount: string | null;
        members_count: number;
    }[];
    recentDraws: {
        id: number;
        somiti_id: number;
        cycle_id: number;
        winner_member_id: number;
        created_at: string | null;
    }[];
};

type MemberProps = { mode: 'member' };

export default function Dashboard(props: AdminProps | MemberProps) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Dashboard"
                        description="Overview, quick actions, and recent activity"
                    />

                    {'mode' in props && props.mode === 'admin' ? (
                        <Button asChild>
                            <Link href={somitis.create()} prefetch>
                                <Plus className="mr-2 size-4" />
                                New somiti
                            </Link>
                        </Button>
                    ) : null}
                </div>

                {'mode' in props && props.mode === 'admin' ? (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex-row items-center justify-between">
                                    <CardTitle className="text-base">
                                        Somitis
                                    </CardTitle>
                                    <Building2 className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-semibold">
                                        {props.stats.somitis}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Active committees
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex-row items-center justify-between">
                                    <CardTitle className="text-base">
                                        Members
                                    </CardTitle>
                                    <Users className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-semibold">
                                        {props.stats.members}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Total registered
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex-row items-center justify-between">
                                    <CardTitle className="text-base">
                                        Draws
                                    </CardTitle>
                                    <Trophy className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-semibold">
                                        {props.stats.draws}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Completed raffle draws
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                            <Card>
                                <CardHeader className="flex-row items-center justify-between">
                                    <CardTitle>Somitis</CardTitle>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={somitis.index()} prefetch>
                                            View all
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {props.somitis.length ? (
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {props.somitis.map((s) => (
                                                <Link
                                                    key={s.id}
                                                    href={somitis.show(s.id)}
                                                    className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                                    prefetch
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <div className="truncate font-medium">
                                                                {s.name}
                                                            </div>
                                                            <div className="mt-1 text-sm text-muted-foreground">
                                                                {s.members_count}{' '}
                                                                members
                                                            </div>
                                                        </div>
                                                        <Badge variant="secondary">
                                                            {s.currency}
                                                        </Badge>
                                                    </div>
                                                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>
                                                            Monthly:{' '}
                                                            {s.monthly_amount ??
                                                                'Not set'}
                                                        </span>
                                                        <BarChart3 className="size-4" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border bg-muted/20 p-6 text-sm text-muted-foreground">
                                            No somitis yet. Create your first
                                            one to start managing members,
                                            contributions, and draws.
                    </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent draws</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {props.recentDraws.length ? (
                                        <div className="space-y-3">
                                            {props.recentDraws.map((d) => (
                                                <div
                                                    key={d.id}
                                                    className="flex items-center justify-between rounded-lg border p-3"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-medium">
                                                            Draw #{d.id}
                    </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Somiti {d.somiti_id}{' '}
                                                            • Cycle {d.cycle_id}
                    </div>
                </div>
                                                    <Badge variant="outline">
                                                        Winner{' '}
                                                        {d.winner_member_id}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border bg-muted/20 p-6 text-sm text-muted-foreground">
                                            No draws yet. Once all members have
                                            paid for the month, you can run a
                                            raffle draw.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                </div>
                    </>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Your account is view-only. Ask an admin to add you
                            to a Somiti to view your contributions and draw
                            status.
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
