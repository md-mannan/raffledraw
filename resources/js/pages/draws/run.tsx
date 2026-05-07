import { Form, Head, Link } from '@inertiajs/react';
import { Calendar, Play, ShieldAlert } from 'lucide-react';
import Heading from '@/components/heading';
import SomitiSectionNav from '@/components/somiti-section-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DrawController from '@/actions/App/Http/Controllers/Admin/DrawController';
import somitis from '@/routes/somitis';
import type { BreadcrumbItem } from '@/types';

type Entrant = { id: number; name: string };

export default function DrawsRun({
    somiti,
    month,
    cycle,
    already_drawn,
    entrants,
    summary,
}: {
    somiti: { id: number; name: string; currency: string; monthly_amount: string | null };
    month: string;
    cycle: { id: number; month: string };
    already_drawn: { id: number } | null;
    entrants: Entrant[];
    summary: { entrants: number; pot_amount: number };
}) {
    return (
        <>
            <Head title="Run draw" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Run draw"
                        description="Preview eligible entrants and run the monthly raffle"
                    />
                    <div className="sm:mt-1">
                        <SomitiSectionNav somiti={somiti} active="draws" />
                    </div>

                    <form
                        action={somitis.draws.run(somiti).url}
                        className="flex items-end gap-2"
                    >
                        <div className="grid gap-1">
                            <Label htmlFor="month">Month</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="month"
                                    name="month"
                                    defaultValue={month}
                                    placeholder="YYYY-MM"
                                    className="w-40 pl-9"
                                />
                            </div>
                        </div>
                        <Button type="submit" variant="outline">
                            Go
                        </Button>
                    </form>
                </div>

                {already_drawn ? (
                    <Card className="border-destructive/40">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldAlert className="size-5 text-destructive" />
                                Draw already completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                This month already has a draw result.
                            </div>
                            <Button asChild variant="outline">
                                <Link
                                    href={
                                        somitis.draws.show({
                                            somiti: somiti.id,
                                            draw: already_drawn.id,
                                        }).url
                                    }
                                >
                                    View result
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : null}

                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle>Eligible entrants</CardTitle>
                            <Badge variant="secondary">
                                {summary.entrants}
                            </Badge>
                        </div>
                        <Badge>Pot: {summary.pot_amount}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {entrants.length === 0 ? (
                            <div className="text-sm text-muted-foreground">
                                No eligible entrants for {cycle.month}. Make
                                sure contributions are marked paid and that
                                members haven’t won before.
                            </div>
                        ) : (
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {entrants.map((e, idx) => (
                                    <div
                                        key={e.id}
                                        className="bg-card text-card-foreground rounded-xl border px-4 py-3 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0 truncate font-medium">
                                                {e.name}
                                            </div>
                                            <span className="text-xs tabular-nums text-muted-foreground">
                                                #{idx + 1}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Form
                            action={
                                somitis.draws.store({
                                    somiti: somiti.id,
                                    cycle: cycle.id,
                                }).url
                            }
                            method="post"
                        >
                            {({ processing }) => (
                                <Button
                                    disabled={
                                        processing ||
                                        entrants.length === 0 ||
                                        Boolean(already_drawn)
                                    }
                                    className="w-full sm:w-auto"
                                >
                                    <Play className="mr-2 size-4" />
                                    Run draw now
                                </Button>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

DrawsRun.layout = {
    breadcrumbs: [
        { title: 'Draws', href: '' },
        { title: 'Run', href: '' },
    ] satisfies BreadcrumbItem[],
};

