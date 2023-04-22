import Link from "next/link";
import ChevronRight from "./Icons/ChevronRight";
import ChevronLeft from "./Icons/ChevronLeft";

import { useRouter } from "next/router";

export interface PaginationProps {
    totalPages: string | number;
    currentPage: string | number;
    isPosts?: boolean;
}

export default function PaginationBar({ totalPages, currentPage, isPosts }: PaginationProps) {
    const router = useRouter();

    currentPage = parseInt(currentPage as string);
    totalPages = parseInt(totalPages as string);
    const prevPage = parseInt(currentPage as unknown as string) - 1 > 0;
    const nextPage =
        parseInt(currentPage as unknown as string) + 1 <= parseInt(totalPages as unknown as string);

    const baseUrl = isPosts ? "/release/" : `/release/tags/${router.query?.tag}/`;

    return (
        <div className="pt-6 pb-8 space-y-2 md:space-y-5">
            <nav className="flex flex-row text-center justify-center items-center lg:justify-between">
                {!prevPage && (
                    <button
                        aria-label="Previous Page (Disabled)"
                        className="flex flex-row items-center text-gray-900 dark:text-gray-100 cursor-not-allowed disabled:opacity-50 invisible"
                        disabled={!prevPage}
                    >
                        <ChevronLeft className="w-5 h-5" aria-label="Paginate to Previous Page" />
                        <span className="hidden lg:block">Previous</span>
                    </button>
                )}
                {prevPage && (
                    <Link
                        href={currentPage - 1 === 1 ? baseUrl : `${baseUrl}page/${currentPage - 1}`}
                        className="break-words"
                        passHref
                    >
                        <button
                            aria-label="Previous Page"
                            className="flex flex-row items-center text-gray-900 dark:text-gray-100 hover:underline focus:outline-none"
                        >
                            <ChevronLeft className="w-5 h-5" aria-label="Paginate to Previous Page" />
                            <span className="hidden lg:block">Previous</span>
                        </button>
                    </Link>
                )}
                <span className="text-gray-700 dark:text-gray-300 font-semibold">{`${currentPage.toLocaleString()} of ${totalPages.toLocaleString()}`}</span>
                {!nextPage && (
                    <button
                        aria-label="Next Page (Disabled)"
                        className="flex flex-row items-center text-gray-900 dark:text-gray-100 cursor-not-allowed disabled:opacity-50 invisible"
                        disabled={!nextPage}
                    >
                        <span className="hidden lg:block">Next</span>
                        <ChevronRight className="w-5 h-5" aria-label="Paginate to Next Page" />
                    </button>
                )}
                {nextPage && (
                    <Link href={`${baseUrl}page/${currentPage + 1}`} className="break-words" passHref>
                        <button
                            aria-label="Previous Page"
                            className="flex flex-row items-center text-gray-900 dark:text-gray-100 hover:underline focus:outline-none"
                        >
                            <span className="hidden lg:block">Next</span>
                            <ChevronRight className="w-5 h-5" aria-label="Paginate to Next Page" />
                        </button>
                    </Link>
                )}
            </nav>
        </div>
    );
}
