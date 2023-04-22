import Link from "next/link";
import React from "react";
import MobileNav from "./MobileNav";

interface HeaderProps {
    isTags?: boolean;
}

export default function HeaderNav(props: HeaderProps) {
    const { isTags } = props;

    return (
        <header className="flex items-center justify-between py-10">
            <div>
                <Link href="/" className="break-words" aria-label="Blog Home">
                    <div className="flex items-center justify-between hover:underline">
                        <div className="hidden h-6 text-2xl font-bold sm:block">N4O Release</div>
                    </div>
                </Link>
            </div>
            <div className="flex items-center text-base leading-5">
                <div className="hidden sm:block">
                    <Link
                        href="/"
                        className="break-words p-1 font-medium text-gray-900 sm:p-4 dark:text-gray-100 hover:opacity-80 transition-opacity duration-150"
                    >
                        Home
                    </Link>
                    <Link
                        href={isTags ? "/release" : "/release/tags"}
                        className="break-words p-1 font-medium text-gray-900 sm:p-4 dark:text-gray-100 hover:opacity-80 transition-opacity duration-150"
                    >
                        {isTags ? "Posts" : "Tags"}
                    </Link>
                    <Link
                        href="/feed.xml"
                        className="break-words p-1 font-medium text-gray-900 sm:p-4 dark:text-gray-100 hover:opacity-80 transition-opacity duration-150"
                    >
                        RSS
                    </Link>
                    <Link
                        href="https://github.com/noaione"
                        className="break-words p-1 font-medium text-gray-900 sm:p-4 dark:text-gray-100 hover:opacity-80 transition-opacity duration-150"
                    >
                        GitHub
                    </Link>
                </div>
                <MobileNav isTags={isTags} />
            </div>
        </header>
    );
}
