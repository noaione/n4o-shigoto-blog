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
    volume: number;
    slug: string;
    extra?: string;
}

function filterMonthHotlinks(mangas: FrontMatterManga[]) {
    const filteredReleases: {
        [date: number]: {
            [title: string]: HotlinksReleasing[];
        };
    } = {};
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
            const mangaTitle = manga.title.trim();
            filteredReleases[parsedDate.day] = filteredReleases[parsedDate.day] || {};
            filteredReleases[parsedDate.day][mangaTitle] = filteredReleases[parsedDate.day][mangaTitle] || [];
            filteredReleases[parsedDate.day][mangaTitle].push({
                date: parsedDate,
                title: mangaTitle,
                slug: manga.slug,
                volume: Number(match.groups.vol),
                extra: match.groups.ex,
            });
        });
    });

    const sortedReleases = Object.keys(filteredReleases)
        .sort()
        .map((month) => {
            const selected = filteredReleases[month as unknown as number];
            const rlsSortedByTitles = Object.keys(selected)
                .sort()
                .map((title) => {
                    const selectedTitle = selected[title];
                    // sort by volume
                    const sortedVolumes = selectedTitle.sort((a, b) => a.volume - b.volume);
                    const finalSortedVolume: { [key: string]: HotlinksReleasing[] } = {};
                    finalSortedVolume[title] = sortedVolumes;
                    return finalSortedVolume;
                })[0];
            const finalSortedMonth: { [key1: number]: { [key2: string]: HotlinksReleasing[] } } = {};
            finalSortedMonth[month as unknown as number] = rlsSortedByTitles;
            return finalSortedMonth;
        })[0];

    // sort titles

    return sortedReleases;
}

interface StaticPropsData {
    posts: FrontMatterManga[];
}

export default function MangaIndexPage({ posts }: StaticPropsData) {
    const rippedMangaRelease = posts.filter((e) => e?.type === "rip");
    const scanMangaRelease = posts.filter((e) => e?.type === "scanlation");
    const thisMonthRelease = filterMonthHotlinks(rippedMangaRelease);
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
                    {Object.keys(thisMonthRelease).length > 0 ? (
                        <>
                            {Object.keys(thisMonthRelease).map((date) => {
                                const monthManga = thisMonthRelease[date as unknown as number];
                                return (
                                    <div key={`monthly-${date}`} className="flex flex-col">
                                        <h3 className="font-medium">
                                            {date} {currentMonth}
                                        </h3>
                                        <div className="flex flex-col flex-wrap justify-center">
                                            {Object.keys(monthManga).map((title) => (
                                                <div
                                                    className="flex flex-col"
                                                    key={"rls-month-" + date + "-" + title}
                                                >
                                                    <h4 className="text-gray-700 dark:text-gray-300">
                                                        {title}
                                                    </h4>
                                                    <ul className="flex flex-col flex-wrap justify-center">
                                                        {monthManga[title].map((rls) => (
                                                            <li className="pl-2 text-gray-700 dark:text-gray-300 before:content-['•_']">
                                                                <Link href={`/manga/${rls.slug}`} passHref>
                                                                    <a className="transition text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500">
                                                                        Volume {rls.volume.toLocaleString()}
                                                                        {rls.extra && ` ${rls.extra}`}
                                                                    </a>
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
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
