import MetadataHead from "@/components/MetadataHead";
import type { FrontMatterExtended } from "@/lib/mdx";
import Head from "next/head";
import Link from "next/link";
import React from "react";

export async function getStaticProps() {
    const { getAllPostsFrontMatter } = await import("@/lib/mdx");
    const posts = await getAllPostsFrontMatter("holoism");

    return { props: { posts } };
}

interface FrontMatterHoloism extends FrontMatterExtended {
    trackNumber: number;
    title: string;
    info: {
        title: string;
        altTitle: string;
    };
}

interface StaticPropsData {
    posts: FrontMatterHoloism[];
}

function createPageTitle(holoFront: FrontMatterHoloism) {
    const pageNum = holoFront.trackNumber.toFixed().padStart(2, "0");
    if (holoFront.title.startsWith("Episode")) {
        // only get the number
        const number = holoFront.title.replace(/^Episode (\d+).*/, "$1");
        return [`${pageNum}. Episode ${number}`, true];
    }

    return [`${pageNum}. ${holoFront.title}`, false];
}

export default function ShigotoHoloismIndex({ posts }: StaticPropsData) {
    const allTracks = posts.sort((a, b) => a.trackNumber - b.trackNumber);
    return (
        <>
            <Head>
                <title>Gensokyo Holoism :: N4O Shigoto</title>
                <MetadataHead.SEO
                    title="Gensokyo Holoism"
                    description="A collaboration between Houshou Marine (Hololive) and COOL&CREATE."
                    image="/assets/img/holoism_cover.jpg"
                    smallImage
                />
                <MetadataHead.Prefetch />
            </Head>
            <main className="container mx-auto py-8 px-4">
                <h1 className="pb-3 text-3xl font-bold">Gensokyo Holoism</h1>
                <p>A collaboration between Houshou Marine (Hololive) and COOL&CREATE.</p>
                <div className="flex flex-col relative min-w-8 break-words bg-clip-border w-96 mt-4">
                    <img className="w-full rounded-md" alt="Cover" src="/assets/img/holoism_cover.jpg" />
                </div>
                <div className="mt-4">
                    <Link href="/" passHref>
                        <a className="text-lg font-medium hover:text-blue-500 transition">🏠 Go Home</a>
                    </Link>
                </div>
                <hr className="border-gray-400 dark:border-gray-500 my-6" />
                <h3 className="text-xl font-semibold">Track List</h3>
                <ul className="mt-2">
                    {allTracks.map((track) => {
                        const [tTitle, isEpisode] = createPageTitle(track);
                        return (
                            <li key={`holoism-track${track.trackNumber}`}>
                                <Link href={`/holoism/track${track.trackNumber.toString().padStart(2, "0")}`}>
                                    <a className="text-blue-700 dark:text-blue-400 font-semibold hover:opacity-80 transition">
                                        {tTitle}
                                    </a>
                                </Link>
                                {isEpisode && ` [Drama]`}
                            </li>
                        );
                    })}
                </ul>
            </main>
        </>
    );
}
