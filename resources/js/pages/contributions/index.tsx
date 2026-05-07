import { Form, Head } from '@inertiajs/react';
import { Calendar, Check, Coins, X } from 'lucide-react';
import Heading from '@/components/heading';
import SomitiSectionNav from '@/components/somiti-section-nav';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ContributionsController from '@/actions/App/Http/Controllers/Admin/ContributionController';
import somitis from '@/routes/somitis';
import type { BreadcrumbItem } from '@/types';

type Row = {
    member: {
        id: number;
        name: string;
        is_active: boolean;
        won_at: string | null;
    };
    contribution: {
        id: number;
        amount: number;
        paid_at: string | null;
        note: string | null;
    } | null;
};

export default function ContributionsIndex({
    month,
    cycle,
    somiti,
    summary,
    rows,
}: {
    month: string;
    cycle: { id: number; month: string };
    somiti: { id: number; name: string; monthly_amount: number; currency: string };
    summary: { paid: number; unpaid: number; total_members: number; pot_amount: number; collected_amount: number };
    rows: Row[];
}) {
    return (
        <>
            <Head title="Contributions" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Monthly contributions"
                        description="Track deposits and draw readiness"
                    />
                    <div className="sm:mt-1">
                        <SomitiSectionNav somiti={somiti} active="contributions" />
                    </div>

                    <form
                        action={somitis.contributions.index(somiti).url}
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

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-base">Paid</CardTitle>
                            <Badge variant="secondary">{summary.paid}</Badge>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-base">Unpaid</CardTitle>
                            <Badge variant="outline">{summary.unpaid}</Badge>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-base">Monthly</CardTitle>
                            <Badge>{somiti.monthly_amount}</Badge>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-base">Collected</CardTitle>
                            <Badge variant="secondary">
                                {summary.collected_amount} {somiti.currency}
                            </Badge>
                        </CardHeader>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y rounded-lg border">
                            {rows.map((row) => {
                                const isPaid = Boolean(row.contribution?.paid_at);
                                const eligible = row.member.is_active && !row.member.won_at && isPaid;

                                return (
                                    <div
                                        key={row.member.id}
                                        className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="min-w-0">
                                            <div className="truncate font-medium">
                                                {row.member.name}
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                {row.member.is_active ? (
                                                    <Badge variant="secondary">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">
                                                        Inactive
                                                    </Badge>
                                                )}
                                                {row.member.won_at ? (
                                                    <Badge variant="outline">
                                                        Won (never eligible)
                                                    </Badge>
                                                ) : null}
                                                <Badge
                                                    variant={
                                                        eligible
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                >
                                                    {eligible
                                                        ? 'Eligible'
                                                        : 'Not eligible'}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                                            <Form
                                                action={
                                                    somitis.contributions.update({
                                                        somiti: somiti.id,
                                                        cycle: cycle.id,
                                                        member: row.member.id,
                                                    }).url
                                                }
                                                method="put"
                                                className="flex items-end gap-2"
                                                options={{ preserveScroll: true }}
                                            >
                                                {({ processing, errors }) => (
                                                    <>
                                                        <input
                                                            type="hidden"
                                                            name="paid"
                                                            value={isPaid ? '0' : '1'}
                                                        />

                                                        <div className="grid gap-1">
                                                            <Label
                                                                htmlFor={`amount-${row.member.id}`}
                                                            >
                                                                Amount
                                                            </Label>
                                                            <Input
                                                                id={`amount-${row.member.id}`}
                                                                name="amount"
                                                                type="number"
                                                                step="0.01"
                                                                min={0}
                                                                defaultValue={
                                                                    row.contribution?.amount ??
                                                                    somiti.monthly_amount
                                                                }
                                                                className="w-full sm:w-32"
                                                            />
                                                            <InputError
                                                                message={
                                                                    // @ts-expect-error - Inertia errors are string maps
                                                                    errors.amount
                                                                }
                                                            />
                                                        </div>

                                                        <div className="grid gap-1">
                                                            <Label
                                                                htmlFor={`note-${row.member.id}`}
                                                            >
                                                                Note
                                                            </Label>
                                                            <Input
                                                                id={`note-${row.member.id}`}
                                                                name="note"
                                                                defaultValue={
                                                                    row.contribution?.note ??
                                                                    ''
                                                                }
                                                                placeholder="Optional…"
                                                                className="w-full sm:w-64"
                                                            />
                                                            <InputError
                                                                message={
                                                                    // @ts-expect-error - Inertia errors are string maps
                                                                    errors.note
                                                                }
                                                            />
                                                        </div>

                                                        <Button
                                                            disabled={processing}
                                                            variant={
                                                                isPaid
                                                                    ? 'outline'
                                                                    : 'default'
                                                            }
                                                            className="min-w-28"
                                                        >
                                                            {isPaid ? (
                                                                <>
                                                                    <X className="mr-2 size-4" />
                                                                    Mark unpaid
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Check className="mr-2 size-4" />
                                                                    Mark paid
                                                                </>
                                                            )}
                                                        </Button>
                                                    </>
                                                )}
                                            </Form>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ContributionsIndex.layout = {
    breadcrumbs: [
        { title: 'Contributions', href: '' },
    ] satisfies BreadcrumbItem[],
};

