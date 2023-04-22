import HeaderNav from "@/components/HeaderNav";
import MetadataHead from "@/components/MetadataHead";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

export function getStaticProps() {
    return {
        props: {
            disableDarkToggle: true,
        },
    };
}

interface Custom404Page {
    asPath: string;
}

function NotFoundPageRelease({ asPath }: Custom404Page) {
    const isTags = asPath.startsWith("/release/tags");
    const goBack = () => {
        if (window && window.history) {
            window.history.back();
        }
    };
    return (
        <div className="max-w-3xl px-4 mx-auto sm:px-6 xl:max-w-5xl xl:px-0">
            <div className="flex flex-col justify-between">
                <HeaderNav isTags={isTags} />
            </div>
            <div className="flex flex-col items-start justify-start md:justify-center md:items-center md:flex-row md:space-x-6 md:mt-24">
                <div className="pt-6 pb-8 space-x-2 md:space-y-5">
                    <h1 className="text-6xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 md:text-8xl md:leading-14 md:border-r-2 md:px-6">
                        404
                    </h1>
                </div>
                <div className="max-w-md">
                    <p className="mb-4 text-xl font-bold leading-normal md:text-2xl">Page not found!</p>
                    <p className="mb-4">We're unable to find the link that you mentioned!</p>
                    <button
                        onClick={goBack}
                        className="inline px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-blue-600 border border-transparent rounded-lg shadow focus:outline-none focus:shadow-outline-blue hover:bg-blue-700 dark:hover:bg-blue-500"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}

function NotFoundPageDefault() {
    const goBack = () => {
        if (window && window.history) {
            window.history.back();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Image
                src="/assets/img/nao250px.png"
                className="rounded-full w-32"
                alt="Error Icon"
                width={250}
                height={250}
            />
            <h2 className="text-2xl mt-4 font-bold">Page not found!</h2>
            <button
                onClick={goBack}
                className="break-words p-2 font-medium mt-4 text-gray-100 hover:opacity-80 transition-opacity duration-150 bg-indigo-500 rounded"
            >
                Go Back
            </button>
        </div>
    );
}

export default function NotFoundPage() {
    // use history to go back
    const router = useRouter();

    const { asPath } = router;

    return (
        <>
            <Head>
                <title>404 :: N4O Shigoto</title>
                <MetadataHead.SEO title="Not Found" description="Page not found" />
                <MetadataHead.Prefetch />
            </Head>
            {asPath.startsWith("/release") ? (
                <NotFoundPageRelease asPath={asPath} />
            ) : (
                <NotFoundPageDefault />
            )}
        </>
    );
}
