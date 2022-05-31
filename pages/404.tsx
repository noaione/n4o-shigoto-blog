import MetadataHead from "@/components/MetadataHead";
import Head from "next/head";
import Link from "next/link";
import React from "react";

export function getStaticProps() {
    return {
        props: {
            disableDarkToggle: true,
        },
    };
}

export default function NotFoundPage() {
    // use history to go back
    const goBack = () => {
        if (window.history) {
            window.history.back();
        }
    };

    return (
        <>
            <Head>
                <title>404 :: N4O Shigoto</title>
                <MetadataHead.SEO title="Not Found" description="Page not found" />
                <MetadataHead.Prefetch />
            </Head>
            <div className="flex flex-col items-center justify-center h-screen">
                <img src="/assets/img/nao250px.png" className="rounded-full h-24" />
                <h2 className="text-2xl mt-4 font-bold">Page not found!</h2>
                <button
                    onClick={goBack}
                    className="break-words p-2 font-medium mt-4 text-gray-100 hover:opacity-80 transition-opacity duration-150 bg-indigo-500 rounded"
                >
                    Go Back
                </button>
            </div>
        </>
    );
}
