import React from "react";

import type { FrontMatterExtended } from "@/lib/mdx";
import Link from "next/link";
import Head from "next/head";
import MetadataHead from "@/components/MetadataHead";

export async function getStaticProps() {
    const { getAllPostsFrontMatter } = await import("@/lib/mdx");
    const posts = await getAllPostsFrontMatter("manga", "title", "asc");

    return { props: { posts } };
}

interface FrontMatterManga extends FrontMatterExtended {
    type?: "rip" | "scanlation";
}

interface StaticPropsData {
    posts: FrontMatterManga[];
}

export default function MangaIndexPage({ posts }: StaticPropsData) {
    const rippedMangaRelease = posts.filter((e) => e?.type === "rip");
    const scanMangaRelease = posts.filter((e) => e?.type === "scanlation");
    return (
        <>
            <Head>
                <title>Manga Index :: N4O Shigoto</title>
                <MetadataHead.Prefetch extras={["https://sevenseasentertainment.com"]} />
                <MetadataHead.SEO
                    title="Manga Index"
                    description="Index collection of released manga"
                    urlPath="/manga"
                />
            </Head>
            <main className="pt-2 pb-8">
                <div className="flex flex-row text-center justify-center text-2xl my-4">
                    <span className="font-light rounded-full border-2 border-emerald-500 select-none text-emerald-400 mx-1 justify-center items-center px-1">
                        立
                    </span>
                    <span className="font-light"> Manga Release Index</span>
                </div>
                <Link href="/" passHref>
                    <a className="mt-2 mx-auto px-4 text-lg font-medium hover:text-red-500 transition">
                        🏠 Home
                    </a>
                </Link>
                <div className="flex flex-col mt-2 mx-auto px-4">
                    <h2 className="text-lg font-medium">Ripped Release</h2>
                    {rippedMangaRelease.length > 0 ? (
                        rippedMangaRelease.map((r) => {
                            return (
                                <div className="flex" key={"rip-" + r.slug}>
                                    <Link href={`/manga/${r.slug}`} passHref>
                                        <a className="transition hover:text-red-500">• {r.title}</a>
                                    </Link>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 cursor-not-allowed select-none">
                            No ripped release yet
                        </p>
                    )}
                </div>
                <div className="flex flex-col mt-2 mx-auto px-4">
                    <h2 className="text-lg font-medium">Scanlation Release</h2>
                    {scanMangaRelease.length > 0 ? (
                        scanMangaRelease.map((r) => {
                            return (
                                <div className="flex" key={"scanlation-" + r.slug}>
                                    <Link href={`/manga/${r.slug}`} passHref>
                                        <a className="transition hover:text-red-500">• {r.title}</a>
                                    </Link>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 cursor-not-allowed select-none">
                            No scanlation release yet
                        </p>
                    )}
                </div>
            </main>
        </>
    );
}
