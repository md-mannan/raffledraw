import { Form, Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SomitiController from '@/actions/App/Http/Controllers/Admin/SomitiController';
import * as somitis from '@/routes/somitis';
import type { BreadcrumbItem } from '@/types';

export default function SomitiCreate({ defaults }: { defaults: { currency: string } }) {
    return (
        <>
            <Head title="Create somiti" />
            <div className="space-y-6 p-4 md:p-6">
                <Heading title="Create somiti" description="Set name, currency, and monthly amount later." />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Somiti details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...SomitiController.store.form()} className="space-y-4">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" name="name" required autoFocus />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="currency">Currency</Label>
                                            <Input id="currency" name="currency" defaultValue={defaults.currency} required />
                                            <InputError message={errors.currency} />
                                        </div>

                                        <div className="grid gap-1.5">
                                            <Label htmlFor="monthly_amount">Monthly amount (optional)</Label>
                                            <Input id="monthly_amount" name="monthly_amount" type="number" step="0.01" min={0} placeholder="Set later…" />
                                            <InputError message={errors.monthly_amount} />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" asChild>
                                            <Link href={somitis.index()}>Cancel</Link>
                                        </Button>
                                        <Button disabled={processing}>Create</Button>
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

SomitiCreate.layout = {
    breadcrumbs: [
        { title: 'Somitis', href: somitis.index() },
        { title: 'Create', href: somitis.create() },
    ] satisfies BreadcrumbItem[],
};

