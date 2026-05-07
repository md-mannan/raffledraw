import { Head, Link } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import SomitiController from '@/actions/App/Http/Controllers/Admin/SomitiController';
import * as somitis from '@/routes/somitis';
import type { BreadcrumbItem } from '@/types';

type Row = {
    id: number;
    name: string;
    currency: string;
    monthly_amount: string | null;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

export default function SomitiIndex({
    somitis: paginated,
    filters,
}: {
    filters: { q: string };
    somitis: {
        data: Row[];
        links: PaginationLink[];
        meta?: { total?: number };
        total?: number;
    };
}) {
    const total =
        paginated.meta?.total ?? paginated.total ?? paginated.data.length ?? 0;

    return (
        <>
            <Head title="Somitis" />
            <div className="space-y-6 p-4 md:p-6">
                <Heading
                    title="Somitis"
                    description="Create and manage multiple committees"
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <form
                        action={SomitiController.index().url}
                        className="relative w-full sm:max-w-md"
                    >
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            name="q"
                            defaultValue={filters?.q ?? ''}
                            placeholder="Search somiti…"
                            className="pl-9"
                        />
                    </form>

                    <Button asChild>
                        <Link href={somitis.create()} prefetch>
                            <Plus className="mr-2 size-4" />
                            New somiti
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>All somitis</CardTitle>
                        <div className="text-sm text-muted-foreground">
                            {total} total
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y rounded-lg border">
                            {paginated.data.map((s) => (
                                <Link
                                    key={s.id}
                                    href={somitis.show(s.id)}
                                    prefetch
                                    className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="min-w-0">
                                        <div className="truncate font-medium">
                                            {s.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Currency: {s.currency}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {s.monthly_amount ? (
                                            <Badge variant="secondary">
                                                Monthly: {s.monthly_amount}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">
                                                Set monthly amount
                                            </Badge>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SomitiIndex.layout = {
    breadcrumbs: [
        { title: 'Somitis', href: somitis.index() },
    ] satisfies BreadcrumbItem[],
};

