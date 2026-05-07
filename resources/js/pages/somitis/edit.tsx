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

export default function SomitiEdit({
    somiti,
    sounds,
}: {
    somiti: {
        id: number;
        name: string;
        currency: string;
        monthly_amount: string | null;
        spin_sound_path: string | null;
        celebration_sound_path: string | null;
    };
    sounds: {
        options: { path: string; name: string; url: string }[];
        defaults: { spin: string; celebration: string };
    };
}) {
    return (
        <>
            <Head title={`Edit: ${somiti.name}`} />
            <div className="space-y-6 p-4 md:p-6">
                <Heading title="Edit somiti" description="Update currency and monthly amount." />

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>{somiti.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={SomitiController.update(somiti.id).url}
                            method="post"
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <input type="hidden" name="_method" value="PUT" />

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" name="name" defaultValue={somiti.name} required />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="currency">Currency</Label>
                                            <Input id="currency" name="currency" defaultValue={somiti.currency} required />
                                            <InputError message={errors.currency} />
                                        </div>

                                        <div className="grid gap-1.5">
                                            <Label htmlFor="monthly_amount">Monthly amount</Label>
                                            <Input
                                                id="monthly_amount"
                                                name="monthly_amount"
                                                type="number"
                                                step="0.01"
                                                min={0}
                                                defaultValue={somiti.monthly_amount ?? ''}
                                                placeholder="Set later…"
                                            />
                                            <InputError message={errors.monthly_amount} />
                                        </div>
                                    </div>

                                    <div className="rounded-xl border p-4">
                                        <div className="text-sm font-medium">Sound settings</div>
                                        <div className="mt-4 grid gap-5">
                                            <div className="grid gap-2">
                                                <Label htmlFor="spin_sound">Spin sound</Label>
                                                <select
                                                    id="spin_sound"
                                                    name="spin_sound"
                                                    defaultValue={somiti.spin_sound_path ?? ''}
                                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                                >
                                                    <option value="">Default</option>
                                                    {sounds.options.map((s) => (
                                                        <option key={s.path} value={s.path}>
                                                            {s.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="spin_sound_file">Or upload new (mp3/wav/ogg)</Label>
                                                    <Input id="spin_sound_file" name="spin_sound_file" type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg" />
                                                    <InputError
                                                        message={
                                                            // @ts-expect-error - Inertia errors are string maps
                                                            errors.spin_sound_file
                                                        }
                                                    />
                                                </div>
                                                <InputError
                                                    message={
                                                        // @ts-expect-error - Inertia errors are string maps
                                                        errors.spin_sound
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="celebration_sound">Celebration sound</Label>
                                                <select
                                                    id="celebration_sound"
                                                    name="celebration_sound"
                                                    defaultValue={somiti.celebration_sound_path ?? ''}
                                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                                >
                                                    <option value="">Default</option>
                                                    {sounds.options.map((s) => (
                                                        <option key={s.path} value={s.path}>
                                                            {s.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="celebration_sound_file">Or upload new (mp3/wav/ogg)</Label>
                                                    <Input id="celebration_sound_file" name="celebration_sound_file" type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg" />
                                                    <InputError
                                                        message={
                                                            // @ts-expect-error - Inertia errors are string maps
                                                            errors.celebration_sound_file
                                                        }
                                                    />
                                                </div>
                                                <InputError
                                                    message={
                                                        // @ts-expect-error - Inertia errors are string maps
                                                        errors.celebration_sound
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" asChild>
                                            <Link href={somitis.show(somiti.id)}>Cancel</Link>
                                        </Button>
                                        <Button disabled={processing}>Save</Button>
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

SomitiEdit.layout = {
    breadcrumbs: [
        { title: 'Somitis', href: somitis.index() },
    ] satisfies BreadcrumbItem[],
};

