'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    className?: string;
}

export default function Pagination({ currentPage, totalPages, className = '' }: PaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Navigate to a specific page using URL search params
    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    // Generate page numbers with ellipsis
    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];
        const showEllipsisThreshold = 7;

        if (totalPages <= showEllipsisThreshold) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    const pageNumbers = getPageNumbers();
    const isPrevDisabled = currentPage === 1;
    const isNextDisabled = currentPage === totalPages;

    return (
        <div className={`flex items-center justify-center gap-1 ${className}`}>
            {/* Previous Button */}
            <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={isPrevDisabled}
                className={`
                    flex items-center gap-1 px-3 py-2 text-sm font-medium rounded transition-colors
                    ${isPrevDisabled
                        ? 'text-[#8b929a]/40 cursor-not-allowed'
                        : 'text-[#8b929a] hover:text-white hover:bg-[#2a475e]'
                    }
                `}
            >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
                {pageNumbers.map((page, index) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-2 py-2 text-[#8b929a]"
                            >
                                ...
                            </span>
                        );
                    }

                    const pageNum = page as number;
                    const isActive = pageNum === currentPage;

                    return (
                        <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`
                                min-w-[36px] h-9 px-3 py-2 text-sm font-medium rounded transition-colors
                                ${isActive
                                    ? 'bg-[#316282] text-white'
                                    : 'text-[#8b929a] hover:text-white hover:bg-[#2a475e]'
                                }
                            `}
                        >
                            {pageNum}
                        </button>
                    );
                })}
            </div>

            {/* Next Button */}
            <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={isNextDisabled}
                className={`
                    flex items-center gap-1 px-3 py-2 text-sm font-medium rounded transition-colors
                    ${isNextDisabled
                        ? 'text-[#8b929a]/40 cursor-not-allowed'
                        : 'text-[#8b929a] hover:text-white hover:bg-[#2a475e]'
                    }
                `}
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
