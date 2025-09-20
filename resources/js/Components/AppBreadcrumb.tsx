import { Link } from '@inertiajs/react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/Components/shadcn/ui/breadcrumb';
import { HomeIcon } from '@radix-ui/react-icons';

export interface BreadcrumbItem {
    label: string;
    href?: string;
    active?: boolean;
}

interface AppBreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function AppBreadcrumb({ items, className }: AppBreadcrumbProps) {
    return (
        <Breadcrumb className={className}>
            <BreadcrumbList>
                {/* Home link */}
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/" className="flex items-center gap-1">
                            <HomeIcon className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only">Home</span>
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {items.length > 0 && <BreadcrumbSeparator />}

                {/* Dynamic breadcrumb items */}
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                        <BreadcrumbItem>
                            {item.active || !item.href ? (
                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link href={item.href}>{item.label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {index < items.length - 1 && <BreadcrumbSeparator />}
                    </div>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}