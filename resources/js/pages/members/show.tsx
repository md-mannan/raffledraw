import { Head, Link } from '@inertiajs/react';
import { Pencil, User } from 'lucide-react';
import Heading from '@/components/heading';
import SomitiSectionNav from '@/components/somiti-section-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import somitis from '@/routes/somitis';
import type { BreadcrumbItem } from '@/types';

type Member = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    is_active: boolean;
    joined_at: string | null;
    won_at: string | null;
    created_at: string | null;
    updated_at: string | null;
};

export default function MembersShow({
    somiti,
    member,
}: {
    somiti: { id: number; name: string; currency: string; monthly_amount: string | null };
    member: Member;
}) {
    return (
        <>
            <Head title={member.name} />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title={member.name}
                        description="Member profile"
                    />

                    <Button asChild variant="outline">
                        <Link
                            href={
                                somitis.members.edit({
                                    somiti: somiti.id,
                                    member: member.id,
                                }).url
                            }
                            prefetch
                        >
                            <Pencil className="mr-2 size-4" />
                            Edit
                        </Link>
                    </Button>
                </div>

                <SomitiSectionNav somiti={somiti} active="members" />

                <Card className="max-w-2xl">
                    <CardHeader className="flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="size-5 text-muted-foreground" />
                            <CardTitle>Details</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            {member.is_active ? (
                                <Badge variant="secondary">Active</Badge>
                            ) : (
                                <Badge variant="outline">Inactive</Badge>
                            )}
                            {member.won_at ? (
                                <Badge variant="outline">
                                    Won (ineligible)
                                </Badge>
                            ) : (
                                <Badge>Eligible</Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-1">
                            <div className="text-sm text-muted-foreground">
                                Email
                            </div>
                            <div className="font-medium">
                                {member.email ?? '—'}
                            </div>
                        </div>

                        <div className="grid gap-1">
                            <div className="text-sm text-muted-foreground">
                                Phone
                            </div>
                            <div className="font-medium">
                                {member.phone ?? '—'}
                            </div>
                        </div>

                        <div className="grid gap-1">
                            <div className="text-sm text-muted-foreground">
                                Joined
                            </div>
                            <div className="font-medium">
                                {member.joined_at ?? '—'}
                            </div>
                        </div>

                        <div className="grid gap-1">
                            <div className="text-sm text-muted-foreground">
                                Winner
                            </div>
                            <div className="font-medium">
                                {member.won_at ? 'Yes' : 'No'}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

MembersShow.layout = {
    breadcrumbs: [
        {
            title: 'Members',
            href: '',
        },
    ] satisfies BreadcrumbItem[],
};

