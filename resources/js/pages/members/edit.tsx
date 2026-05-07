import { Form, Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import SomitiSectionNav from '@/components/somiti-section-nav';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MembersController from '@/actions/App/Http/Controllers/Admin/MemberController';
import somitis from '@/routes/somitis';
import type { BreadcrumbItem } from '@/types';

type Member = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    is_active: boolean;
    joined_at: string | null;
};

export default function MembersEdit({
    somiti,
    member,
}: {
    somiti: { id: number; name: string; currency: string; monthly_amount: string | null };
    member: Member;
}) {
    return (
        <>
            <Head title={`Edit: ${member.name}`} />

            <div className="space-y-6 p-4 md:p-6">
                <Heading
                    title="Edit member"
                    description="Update member profile information"
                />

                <SomitiSectionNav somiti={somiti} active="members" />

                <Card className="max-w-2xl">
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>{member.name}</CardTitle>
                        {member.is_active ? (
                            <Badge variant="secondary">Active</Badge>
                        ) : (
                            <Badge variant="outline">Inactive</Badge>
                        )}
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={
                                MembersController.update({
                                    somiti: somiti.id,
                                    member: member.id,
                                }).url
                            }
                            method="post"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <input type="hidden" name="_method" value="PUT" />
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={member.name}
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">
                                            Email (optional)
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            defaultValue={member.email ?? ''}
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">
                                            Phone (optional)
                                        </Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            defaultValue={member.phone ?? ''}
                                        />
                                        <InputError message={errors.phone} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="joined_at">
                                            Joined date (optional)
                                        </Label>
                                        <Input
                                            id="joined_at"
                                            name="joined_at"
                                            type="date"
                                            defaultValue={member.joined_at ?? ''}
                                        />
                                        <InputError
                                            message={errors.joined_at}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="is_active">
                                            Active status
                                        </Label>
                                        <select
                                            id="is_active"
                                            name="is_active"
                                            defaultValue={member.is_active ? '1' : '0'}
                                            className="border-input bg-background text-foreground h-9 w-full rounded-md border px-3 text-sm shadow-xs"
                                        >
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
                                        <InputError
                                            message={errors.is_active}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            asChild
                                        >
                                            <Link
                                                href={
                                                    somitis.members.show({
                                                        somiti: somiti.id,
                                                        member: member.id,
                                                    }).url
                                                }
                                            >
                                                Cancel
                                            </Link>
                                        </Button>
                                        <Button
                                            disabled={processing}
                                            data-test="member-edit-submit"
                                        >
                                            Save changes
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

MembersEdit.layout = {
    breadcrumbs: [
        { title: 'Members', href: '' },
    ] satisfies BreadcrumbItem[],
};

