import { Form, Head } from '@inertiajs/react';
import {
    CheckCircle2,
    Database,
    Folder,
    Globe,
    Shield,
    User,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import InstallController from '@/actions/App/Http/Controllers/InstallController';
import AppLogo from '@/components/app-logo';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CURRENCY_CODES } from '@/lib/currency-codes';
import { cn } from '@/lib/utils';

type StepId = 'requirements' | 'application' | 'database' | 'super_admin';

type Step = {
    id: StepId;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
};

export default function Install({
    defaults,
    requirements,
}: {
    defaults: { currency: string };
    requirements: {
        php: string;
        storage_writable: boolean;
        env_exists: boolean;
    };
}) {
    const steps: Step[] = useMemo(
        () => [
            {
                id: 'requirements',
                title: 'Requirements',
                subtitle: 'Environment checks',
                icon: Folder,
            },
            {
                id: 'application',
                title: 'Application',
                subtitle: 'Name & branding',
                icon: Globe,
            },
            {
                id: 'database',
                title: 'Database',
                subtitle: 'Connection details',
                icon: Database,
            },
            {
                id: 'super_admin',
                title: 'Super admin',
                subtitle: 'First account',
                icon: Shield,
            },
        ],
        [],
    );

    const [step, setStep] = useState<StepId>('requirements');
    const [language, setLanguage] = useState<'en' | 'bn'>('en');
    const [currency, setCurrency] = useState(defaults.currency);
    const [dbDriver, setDbDriver] = useState<'sqlite' | 'mysql'>('sqlite');

    // Controlled form state (prevents values disappearing between steps)
    const [appName, setAppName] = useState('');
    const [appUrl, setAppUrl] = useState('');
    const [sqliteFile, setSqliteFile] = useState('database.sqlite');
    const [dbHost, setDbHost] = useState('127.0.0.1');
    const [dbPort, setDbPort] = useState('3306');
    const [dbName, setDbName] = useState('');
    const [dbUsername, setDbUsername] = useState('');
    const [dbPassword, setDbPassword] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [adminPasswordConfirmation, setAdminPasswordConfirmation] =
        useState('');

    const [currencyOpen, setCurrencyOpen] = useState(false);
    const [currencyQuery, setCurrencyQuery] = useState('');

    const activeIndex = steps.findIndex((s) => s.id === step);
    const canContinueRequirements =
        requirements.storage_writable && requirements.env_exists;

    const goNext = () => {
        const next = steps[activeIndex + 1];

        if (next) {
            setStep(next.id);
        }
    };
    const goBack = () => {
        const prev = steps[activeIndex - 1];

        if (prev) {
            setStep(prev.id);
        }
    };

    return (
        <>
            <Head title="Install" />

            <div className="min-h-svh bg-background lg:h-svh lg:overflow-hidden">
                <div className="mx-auto grid max-w-6xl gap-4 p-4 lg:h-full lg:grid-cols-[260px_1fr] lg:items-stretch">
                    <Card className="h-full overflow-hidden">
                        <CardHeader className="py-4">
                            <div className="flex items-center gap-2">
                                <AppLogo />
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                SETUP
                            </div>
                            <CardTitle className="text-base">
                                {String(
                                    // Inertia shared name will be updated after install
                                    // so keep a placeholder here.
                                    'Installer',
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pb-4">
                            <div className="text-xs text-muted-foreground">
                                STEPS
                            </div>
                            <div className="space-y-2">
                                {steps.map((s, idx) => {
                                    const Icon = s.icon;
                                    const isDone = idx < activeIndex;
                                    const isActive = s.id === step;

                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setStep(s.id)}
                                            className={cn(
                                                'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
                                                isActive
                                                    ? 'bg-muted'
                                                    : 'bg-card hover:bg-muted/50',
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'flex size-8 items-center justify-center rounded-md border',
                                                    isDone
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-background',
                                                )}
                                            >
                                                {isDone ? (
                                                    <CheckCircle2 className="size-4" />
                                                ) : (
                                                    <Icon className="size-4 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-medium">
                                                    {s.title}
                                                </div>
                                                <div className="truncate text-xs text-muted-foreground">
                                                    {s.subtitle}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="pt-4 text-xs text-muted-foreground">
                                After setup you can create multiple Somitis from
                                the admin panel.
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="h-full overflow-hidden">
                        <CardHeader className="py-4">
                            <CardTitle>
                                {steps.find((s) => s.id === step)?.title}
                            </CardTitle>
                            <div className="text-sm text-muted-foreground">
                                {steps.find((s) => s.id === step)?.subtitle}
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4 pb-4">
                            <Form
                                action={InstallController.store().url}
                                method="post"
                                encType="multipart/form-data"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        {/* Hidden fields (wizard state) */}
                                        <input
                                            type="hidden"
                                            name="language"
                                            value={language}
                                        />
                                        <input
                                            type="hidden"
                                            name="currency"
                                            value={currency}
                                        />
                                        <input
                                            type="hidden"
                                            name="db_driver"
                                            value={dbDriver}
                                        />

                                        <div
                                            className={cn(
                                                'space-y-4',
                                                step === 'requirements'
                                                    ? ''
                                                    : 'hidden',
                                            )}
                                        >
                                                <div className="grid gap-2">
                                                    <Label>Language</Label>
                                                    <Select
                                                        value={language}
                                                        onValueChange={(v) =>
                                                            setLanguage(
                                                                v as 'en' | 'bn',
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent align="start">
                                                            <SelectItem value="en">
                                                                English (English)
                                                            </SelectItem>
                                                            <SelectItem value="bn">
                                                                বাংলা (Bangla)
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="rounded-lg border">
                                                    <div className="border-b px-4 py-3 text-sm font-medium">
                                                        System checks
                                                    </div>
                                                    <div className="space-y-2 p-4">
                                                        <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm">
                                                            <span>PHP</span>
                                                            <span className="text-muted-foreground">
                                                                {requirements.php}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm">
                                                            <span>
                                                                Writable storage
                                                                & cache
                                                            </span>
                                                            {requirements.storage_writable ? (
                                                                <CheckCircle2 className="size-4 text-green-600" />
                                                            ) : (
                                                                <Badge variant="destructive">
                                                                    Fix
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm">
                                                            <span>
                                                                Environment file
                                                            </span>
                                                            {requirements.env_exists ? (
                                                                <CheckCircle2 className="size-4 text-green-600" />
                                                            ) : (
                                                                <Badge variant="destructive">
                                                                    Missing
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                        </div>

                                        <div
                                            className={cn(
                                                'space-y-4',
                                                step === 'application'
                                                    ? ''
                                                    : 'hidden',
                                            )}
                                        >
                                                <div className="grid gap-2">
                                                    <Label htmlFor="app_name">
                                                        Application name
                                                    </Label>
                                                    <Input
                                                        id="app_name"
                                                        name="app_name"
                                                        placeholder="Your app name"
                                                        value={appName}
                                                        onChange={(e) =>
                                                            setAppName(e.target.value)
                                                        }
                                                        required
                                                    />
                                                    <InputError
                                                        message={errors.app_name}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="app_url">
                                                        App URL (optional)
                                                    </Label>
                                                    <Input
                                                        id="app_url"
                                                        name="app_url"
                                                        placeholder="https://app.example.com"
                                                        value={appUrl}
                                                        onChange={(e) =>
                                                            setAppUrl(e.target.value)
                                                        }
                                                    />
                                                    <InputError
                                                        message={errors.app_url}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="logo">
                                                        Logo (optional)
                                                    </Label>
                                                    <Input
                                                        id="logo"
                                                        name="logo"
                                                        type="file"
                                                        accept="image/*"
                                                    />
                                                    <InputError
                                                        message={errors.logo}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label>
                                                        Default currency
                                                    </Label>
                                                    <DropdownMenu
                                                        open={currencyOpen}
                                                        onOpenChange={(open) => {
                                                            setCurrencyOpen(open);

                                                            if (!open) {
                                                                setCurrencyQuery('');
                                                            }
                                                        }}
                                                    >
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="w-full justify-between font-normal"
                                                            >
                                                                <span>
                                                                    {currency ||
                                                                        'Select currency'}
                                                                </span>
                                                                <span className="text-muted-foreground">
                                                                    ⌄
                                                                </span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="start"
                                                            className="w-[320px] p-2"
                                                        >
                                                            <div className="grid gap-2">
                                                                <Input
                                                                    value={
                                                                        currencyQuery
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setCurrencyQuery(
                                                                            e.target.value,
                                                                        )
                                                                    }
                                                                    placeholder="Search currency code… (e.g. KWD)"
                                                                    autoComplete="off"
                                                                />
                                                                <div className="max-h-56 overflow-auto rounded-md border">
                                                                    {CURRENCY_CODES.filter(
                                                                        (c) =>
                                                                            currencyQuery
                                                                                ? c.includes(
                                                                                      currencyQuery
                                                                                          .toUpperCase()
                                                                                          .replace(
                                                                                              /[^A-Z]/g,
                                                                                              '',
                                                                                          ),
                                                                                  )
                                                                                : true,
                                                                    ).map((c) => (
                                                                        <button
                                                                            key={c}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setCurrency(
                                                                                    c,
                                                                                );
                                                                                setCurrencyOpen(
                                                                                    false,
                                                                                );
                                                                            }}
                                                                            className={cn(
                                                                                'flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted',
                                                                                c ===
                                                                                    currency
                                                                                    ? 'bg-muted'
                                                                                    : '',
                                                                            )}
                                                                        >
                                                                            <span className="font-medium">
                                                                                {c}
                                                                            </span>
                                                                            {c ===
                                                                            currency ? (
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    Selected
                                                                                </span>
                                                                            ) : null}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <div className="text-xs text-muted-foreground">
                                                        Search and pick a 3-letter
                                                        currency code (ISO 4217).
                                                    </div>
                                                </div>
                                        </div>

                                        <div
                                            className={cn(
                                                'space-y-4',
                                                step === 'database'
                                                    ? ''
                                                    : 'hidden',
                                            )}
                                        >
                                                <div className="grid gap-2">
                                                    <Label>Driver</Label>
                                                    <Select
                                                        value={dbDriver}
                                                        onValueChange={(v) =>
                                                            setDbDriver(
                                                                v as 'sqlite' | 'mysql',
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent align="start">
                                                            <SelectItem value="sqlite">
                                                                SQLite (file)
                                                            </SelectItem>
                                                            <SelectItem value="mysql">
                                                                MySQL / MariaDB
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {dbDriver === 'sqlite' ? (
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="db_database">
                                                            SQLite file name
                                                        </Label>
                                                        <Input
                                                            id="db_database"
                                                            name="db_database"
                                                            placeholder="database.sqlite"
                                                            value={sqliteFile}
                                                            onChange={(e) =>
                                                                setSqliteFile(
                                                                    e.target.value,
                                                                )
                                                            }
                                                            required
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.db_database
                                                            }
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="db_host">
                                                                    Host
                                                                </Label>
                                                                <Input
                                                                    id="db_host"
                                                                    name="db_host"
                                                                    value={dbHost}
                                                                    onChange={(e) =>
                                                                        setDbHost(
                                                                            e.target.value,
                                                                        )
                                                                    }
                                                                    autoComplete="off"
                                                                    required
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors.db_host
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="db_port">
                                                                    Port
                                                                </Label>
                                                                <Input
                                                                    id="db_port"
                                                                    name="db_port"
                                                                    type="number"
                                                                    value={dbPort}
                                                                    onChange={(e) =>
                                                                        setDbPort(
                                                                            e.target.value,
                                                                        )
                                                                    }
                                                                    autoComplete="off"
                                                                    required
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors.db_port
                                                                    }
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="db_database">
                                                                    Database
                                                                    name
                                                                </Label>
                                                                <Input
                                                                    id="db_database"
                                                                    name="db_database"
                                                                    autoComplete="off"
                                                                    value={dbName}
                                                                    onChange={(e) =>
                                                                        setDbName(
                                                                            e.target.value,
                                                                        )
                                                                    }
                                                                    required
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors.db_database
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="db_username">
                                                                    Username
                                                                </Label>
                                                                <Input
                                                                    id="db_username"
                                                                    name="db_username"
                                                                    autoComplete="off"
                                                                    value={dbUsername}
                                                                    onChange={(e) =>
                                                                        setDbUsername(
                                                                            e.target.value,
                                                                        )
                                                                    }
                                                                    required
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors.db_username
                                                                    }
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label htmlFor="db_password">
                                                                Password
                                                            </Label>
                                                            <Input
                                                                id="db_password"
                                                                name="db_password"
                                                                type="password"
                                                                autoComplete="new-password"
                                                                value={dbPassword}
                                                                onChange={(e) =>
                                                                    setDbPassword(
                                                                        e.target.value,
                                                                    )
                                                                }
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.db_password
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                        </div>

                                        <div
                                            className={cn(
                                                'space-y-4',
                                                step === 'super_admin'
                                                    ? ''
                                                    : 'hidden',
                                            )}
                                        >
                                                <div className="grid gap-2">
                                                    <Label htmlFor="admin_name">
                                                        Name
                                                    </Label>
                                                    <Input
                                                        id="admin_name"
                                                        name="admin_name"
                                                        autoComplete="name"
                                                        value={adminName}
                                                        onChange={(e) =>
                                                            setAdminName(
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                    />
                                                    <InputError
                                                        message={errors.admin_name}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="admin_email">
                                                        Email
                                                    </Label>
                                                    <Input
                                                        id="admin_email"
                                                        name="admin_email"
                                                        type="email"
                                                        autoComplete="email"
                                                        value={adminEmail}
                                                        onChange={(e) =>
                                                            setAdminEmail(
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                    />
                                                    <InputError
                                                        message={errors.admin_email}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="admin_password">
                                                        Password
                                                    </Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="admin_password"
                                                            name="admin_password"
                                                            type="password"
                                                            autoComplete="new-password"
                                                            value={adminPassword}
                                                            onChange={(e) =>
                                                                setAdminPassword(
                                                                    e.target.value,
                                                                )
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    <InputError
                                                        message={
                                                            errors.admin_password
                                                        }
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="admin_password_confirmation">
                                                        Confirm password
                                                    </Label>
                                                    <Input
                                                        id="admin_password_confirmation"
                                                        name="admin_password_confirmation"
                                                        type="password"
                                                        value={
                                                            adminPasswordConfirmation
                                                        }
                                                        onChange={(e) =>
                                                            setAdminPasswordConfirmation(
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                    />
                                                </div>

                                                <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <User className="size-4" />
                                                        First user becomes{' '}
                                                        <span className="font-medium text-foreground">
                                                            Super Admin
                                                        </span>
                                                        .
                                                    </div>
                                                </div>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={goBack}
                                                disabled={activeIndex === 0}
                                            >
                                                Back
                                            </Button>

                                            {activeIndex < steps.length - 1 ? (
                                                <Button
                                                    type="button"
                                                    onClick={goNext}
                                                    disabled={
                                                        step === 'requirements' &&
                                                        !canContinueRequirements
                                                    }
                                                >
                                                    Continue
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    data-test="install-finish"
                                                >
                                                    Finish installation
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

