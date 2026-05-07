import { Form, Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import SomitiSectionNav from '@/components/somiti-section-nav';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MembersController from '@/actions/App/Http/Controllers/Admin/MemberController';
import somitis from '@/routes/somitis';
import type { BreadcrumbItem } from '@/types';

export default function MembersCreate({
    somiti,
}: {
    somiti: { id: number; name: string; currency: string; monthly_amount: string | null };
}) {
    return (
        <>
            <Head title="Add member" />

            <div className="space-y-6 p-4 md:p-6">
                <Heading
                    title={`${somiti.name} · Add member`}
                    description="Create a new member profile"
                />

                <SomitiSectionNav somiti={somiti} active="members" />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Member details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={MembersController.store({ somiti: somiti.id }).url}
                            method="post"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="Full name"
                                            required
                                            autoFocus
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
                                            placeholder="name@example.com"
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
                                            placeholder="01XXXXXXXXX"
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
                                        />
                                        <InputError
                                            message={errors.joined_at}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            asChild
                                        >
                                            <Link
                                                href={somitis.members.index(somiti).url}
                                            >
                                                Cancel
                                            </Link>
                                        </Button>
                                        <Button
                                            disabled={processing}
                                            data-test="member-create-submit"
                                        >
                                            Create member
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

MembersCreate.layout = {
    breadcrumbs: [
        { title: 'Somitis', href: somitis.index().url },
        { title: 'Members', href: '' },
        { title: 'Add', href: '' },
    ] satisfies BreadcrumbItem[],
};

