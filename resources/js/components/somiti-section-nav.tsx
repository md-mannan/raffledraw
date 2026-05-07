import { Link } from '@inertiajs/react';
import { Coins, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import somitis from '@/routes/somitis';

type SomitiLite = { id: number; name?: string };

export default function SomitiSectionNav({
    somiti: s,
    active,
}: {
    somiti: SomitiLite;
    active: 'overview' | 'members' | 'contributions' | 'draws';
}) {
    const items = [
        { key: 'overview', label: 'Overview', href: somitis.show(s).url },
        {
            key: 'members',
            label: 'Members',
            href: somitis.members.index(s).url,
            icon: Users,
        },
        {
            key: 'contributions',
            label: 'Contributions',
            href: somitis.contributions.index(s).url,
            icon: Coins,
        },
        { key: 'draws', label: 'Draws', href: somitis.draws.index(s).url, icon: Trophy },
    ] as const;

    return (
        <div className="flex flex-wrap gap-2">
            {items.map((it) => {
                const isActive = it.key === active;
                const Icon = it.icon;
                return (
                    <Button
                        key={it.key}
                        asChild
                        size="sm"
                        variant={isActive ? 'default' : 'outline'}
                        className={cn(isActive ? '' : 'bg-background')}
                    >
                        <Link href={it.href} prefetch>
                            {Icon ? <Icon className="mr-2 size-4" /> : null}
                            {it.label}
                        </Link>
                    </Button>
                );
            })}
        </div>
    );
}

