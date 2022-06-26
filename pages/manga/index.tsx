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

const VolumeWaitRe = /Volume (?<vol>[\d]{1,2}) (?<ex>\[Final\] )?\((?<date>[\d]{1,2} [\w]+ [\d]{4})\)/g;

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

type InnerUpcomingReleases = { [title: string]: HotlinksReleasing[] };
type UpcomingReleases = { [dateData: string]: InnerUpcomingReleases };

function getUpcomingReleaseAtMonth(
    mangas: FrontMatterManga[],
    year: number,
    month: number,
    ignoreDay = false
) {
    const filteredReleases: UpcomingReleases = {};
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

            const parsedDate = DateTime.fromFormat(date, "d MMMM yyyy", { zone: "UTC" });
            if (!parsedDate.isValid) {
                return;
            }
            if (parsedDate.year !== year) {
                return;
            }
            // check if it's in current month
            if (parsedDate.month !== month) {
                return;
            }
            // check if current date is larger than parsed date
            if (!ignoreDay && currentTime.day > parsedDate.day) {
                return;
            }
            const dateFmt = parsedDate.toFormat("yyyy-MM-dd");
            const mangaTitle = manga.title.trim();
            filteredReleases[dateFmt] = filteredReleases[dateFmt] || {};
            filteredReleases[dateFmt][mangaTitle] = filteredReleases[dateFmt][mangaTitle] || [];
            filteredReleases[dateFmt][mangaTitle].push({
                date: parsedDate,
                title: mangaTitle,
                slug: manga.slug,
                volume: Number(match.groups.vol),
                extra: match.groups.ex,
            });
        });
    });
    return filteredReleases;
}

function filterMonthHotlinks(mangas: FrontMatterManga[]) {
    const currentTime = DateTime.utc();
    const currentMonthData = getUpcomingReleaseAtMonth(mangas, currentTime.year, currentTime.month);
    // determine if we should get next month release
    // only get if it's the final week of the month
    let filteredReleases: UpcomingReleases = { ...currentMonthData };
    if (currentTime.day >= 26) {
        let nextMonth = currentTime.month + 1;
        let targetYear = currentTime.year;
        if (nextMonth > 12) {
            nextMonth = 1;
            targetYear += 1;
        }
        const nextMonthData = getUpcomingReleaseAtMonth(mangas, targetYear, nextMonth, true);
        filteredReleases = { ...currentMonthData, ...nextMonthData };
    }

    const temporarySortedData = Object.keys(filteredReleases)
        .sort()
        .map((month) => {
            const selected = filteredReleases[month];
            const rlsSortedByTitles = Object.keys(selected)
                .sort()
                .map((title) => {
                    const selectedTitle = selected[title];
                    // sort by volume
                    const sortedVolumes = selectedTitle.sort((a, b) => a.volume - b.volume);
                    const finalSortedVolume: { [key: string]: HotlinksReleasing[] } = {};
                    finalSortedVolume[title] = sortedVolumes;
                    return finalSortedVolume;
                });
            const finalSortedMonth: UpcomingReleases = {};
            const temporaryMonthData: InnerUpcomingReleases = {};
            rlsSortedByTitles.forEach((rls) => {
                const firstKey = Object.keys(rls)[0];
                temporaryMonthData[firstKey] = rls[firstKey];
            });
            finalSortedMonth[month] = temporaryMonthData;
            return finalSortedMonth;
        });
    const sortedReleases: UpcomingReleases = {};
    temporarySortedData.forEach((month) => {
        const firstKey = Object.keys(month)[0];
        sortedReleases[firstKey] = month[firstKey];
    });

    return sortedReleases;
}

interface StaticPropsData {
    posts: FrontMatterManga[];
}

export default function MangaIndexPage({ posts }: StaticPropsData) {
    const rippedMangaRelease = posts.filter((e) => e?.type === "rip");
    const scanMangaRelease = posts.filter((e) => e?.type === "scanlation");
    const thisMonthRelease = filterMonthHotlinks(rippedMangaRelease);

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
                                const monthManga = thisMonthRelease[date];
                                const parsedDt = DateTime.fromFormat(date, "yyyy-MM-dd");
                                return (
                                    <div key={`monthly-${date}`} className="flex flex-col">
                                        <h3 className="font-medium">{parsedDt.toFormat("dd MMMM yyyy")}</h3>
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
                                                            <li
                                                                key={`rls-month-${date}-${title}-v${rls.volume}`}
                                                                className="pl-2 text-gray-700 dark:text-gray-300 before:content-['•_']"
                                                            >
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
