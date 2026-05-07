import { Head, Link } from '@inertiajs/react';
import { Plus, Search, Users } from 'lucide-react';
import Heading from '@/components/heading';
import SomitiSectionNav from '@/components/somiti-section-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';
import somitis from '@/routes/somitis';

type MemberRow = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    is_active: boolean;
    joined_at: string | null;
    won_at: string | null;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

export default function MembersIndex({
    somiti,
    members: paginated,
    filters,
}: {
    somiti: { id: number; name: string; currency: string; monthly_amount: string | null };
    filters: { q: string };
    members: {
        data: MemberRow[];
        links: PaginationLink[];
        meta?: { from?: number | null; to?: number | null; total?: number };
        total?: number;
    };
}) {
    const q = filters?.q ?? '';
    const total =
        paginated.meta?.total ?? paginated.total ?? paginated.data.length ?? 0;

    return (
        <>
            <Head title="Members" />

            <div className="space-y-6 p-4 md:p-6">
                <Heading
                    title={`${somiti.name} · Members`}
                    description="Manage members and eligibility"
                />

                <SomitiSectionNav somiti={somiti} active="members" />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <form
                        action={somitis.members.index(somiti).url}
                        className="relative w-full sm:max-w-md"
                    >
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            name="q"
                            defaultValue={q}
                            placeholder="Search by name, email, phone…"
                            className="pl-9"
                        />
                    </form>

                    <Button asChild>
                        <Link href={somitis.members.create(somiti).url} prefetch>
                            <Plus className="mr-2 size-4" />
                            Add member
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="size-5 text-muted-foreground" />
                            <CardTitle>All members</CardTitle>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {total} total
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y rounded-lg border">
                            {paginated.data.length === 0 ? (
                                <div className="p-6 text-sm text-muted-foreground">
                                    No members found.
                                </div>
                            ) : (
                                paginated.data.map((m) => (
                                    <Link
                                        key={m.id}
                                        href={
                                            somitis.members.show({
                                                somiti: somiti.id,
                                                member: m.id,
                                            }).url
                                        }
                                        className="flex flex-col gap-2 p-4 transition-colors hover:bg-muted/50 md:flex-row md:items-center md:justify-between"
                                        prefetch
                                    >
                                        <div className="min-w-0">
                                            <div className="truncate font-medium">
                                                {m.name}
                                            </div>
                                            <div className="truncate text-sm text-muted-foreground">
                                                {m.email ?? '—'}{' '}
                                                {m.phone ? `• ${m.phone}` : ''}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {m.is_active ? (
                                                <Badge variant="secondary">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">
                                                    Inactive
                                                </Badge>
                                            )}
                                            {m.won_at ? (
                                                <Badge variant="outline">
                                                    Won (ineligible)
                                                </Badge>
                                            ) : (
                                                <Badge>Eligible</Badge>
                                            )}
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

MembersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Members',
            href: '',
        },
    ] satisfies BreadcrumbItem[],
};

