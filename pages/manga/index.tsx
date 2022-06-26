import React from "react";
import { DateTime } from "luxon";

import type { FrontMatterExtended } from "@/lib/mdx";
import Link from "next/link";
import Head from "next/head";
import MetadataHead from "@/components/MetadataHead";
import { isNone } from "@/lib/utils";

export async function getStaticProps() {
    const { getAllPostsFrontMatter } = await import("@/lib/mdx");
    const posts = await getAllPostsFrontMatter("manga", "title", "asc");

    return { props: { posts } };
}

const VolumeWaitRe = /Volume (?<vol>[\d]{1,2}) (?<ex>\[Final\] )?\((?<date>[\d]{1,2} [\w]+ [\d]{4})\)/;

interface SimpleHotlinks {
    url?: string;
    title?: string;
}

interface FrontMatterManga extends FrontMatterExtended {
    type?: "rip" | "scanlation";
    hotlinks?: (SimpleHotlinks | string)[];
}

interface HotlinksReleasing {
    date: DateTime;
    title: string;
    slug: string;
}

function filterMonthHotlinks(mangas: FrontMatterManga[]) {
    const finalDataset: HotlinksReleasing[] = [];
    const currentTime = DateTime.utc();
    mangas.forEach((manga) => {
        const { hotlinks } = manga;
        if (!Array.isArray(hotlinks)) {
            return;
        }
        if (hotlinks.length < 1) {
            return;
        }

        hotlinks.forEach((hotlink) => {
            let selectTitle: string | undefined;
            if (typeof hotlink === "string") {
                selectTitle = hotlink;
            } else {
                if (!isNone(hotlink.title)) {
                    selectTitle = hotlink.title;
                }
            }

            if (isNone(selectTitle)) {
                return;
            }

            const match = VolumeWaitRe.exec(selectTitle);
            if (isNone(match)) {
                return;
            }
            if (isNone(match.groups)) {
                return;
            }

            const { date } = match.groups;
            if (isNone(date)) {
                return;
            }

            const parsedDate = DateTime.fromFormat(date, "dd MMMM yyyy", { zone: "UTC" });
            // check if it's in current month
            if (parsedDate.month !== currentTime.month) {
                return;
            }
            // check if current date is larger than parsed date
            if (currentTime.day > parsedDate.day) {
                return;
            }
            finalDataset.push({
                date: parsedDate,
                title: manga.title.trim(),
                slug: manga.slug,
            });
        });
    });
    return finalDataset;
}

interface StaticPropsData {
    posts: FrontMatterManga[];
}

export default function MangaIndexPage({ posts }: StaticPropsData) {
    const rippedMangaRelease = posts.filter((e) => e?.type === "rip");
    const scanMangaRelease = posts.filter((e) => e?.type === "scanlation");
    const thisMonthRelease = filterMonthHotlinks(rippedMangaRelease);

    // group by day
    const groupedByDay = thisMonthRelease.reduce<{ [date: string]: HotlinksReleasing[] }>((acc, cur) => {
        const date = cur.date.toFormat("dd");
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(cur);
        return acc;
    }, {});
    const currentMonth = DateTime.utc().toFormat("MMMM");

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
                    <h2 className="text-lg font-medium">Upcoming Releases</h2>
                    {Object.keys(groupedByDay).length > 0 ? (
                        <>
                            {Object.keys(groupedByDay).map((date) => {
                                const monthManga = groupedByDay[date];
                                return (
                                    <div key={`monthly-${date}`} className="flex flex-col">
                                        <h3 className="font-medium">
                                            {date} {currentMonth}
                                        </h3>
                                        <div className="flex flex-col flex-wrap justify-center">
                                            {monthManga.map((e) => (
                                                <div
                                                    className="flex"
                                                    key={"rls-month-" + e.date.toString() + "-" + e.title}
                                                >
                                                    <Link href={`/manga/${e.slug}`} passHref>
                                                        <a className="transition text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500">
                                                            • {e.title}
                                                        </a>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 cursor-not-allowed select-none">
                            No Upcoming Releases
                        </p>
                    )}
                </div>
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
