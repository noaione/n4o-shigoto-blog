import React from "react";
import { DateTime } from "luxon";

import type { FrontMatterExtended } from "@/lib/mdx";
import Link from "next/link";
import Head from "next/head";
import MetadataHead from "@/components/MetadataHead";
import { isNone, NoneType, Nullable } from "@/lib/utils";

export async function getStaticProps() {
    const { getAllPostsFrontMatter } = await import("@/lib/mdx");
    const posts = await getAllPostsFrontMatter("manga", "title", "asc");

    return { props: { posts } };
}

const VolumeWaitRe = /Volumes? (?<vol>[\d]{1,2}) (?<ex>\[.*\] )?\((?<date>[\d]{1,2} [\w]+ [\d]{4})\)/;

interface SimpleHotlinks {
    url?: string;
    title?: string;
}

type ProjectStatus = "ongoing" | "dropped" | "finished" | "paused" | "planned" | "cancelled";

interface FrontMatterManga extends FrontMatterExtended {
    type?: "rip" | "scanlation";
    hotlinks?: (SimpleHotlinks | string)[];
    status?: ProjectStatus;
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

// @ts-ignore
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function parseMangaReleaseData(
    hotlink: SimpleHotlinks | string,
    manga: FrontMatterManga,
    targetYear: Nullable<number> = null,
    targetMonth: Nullable<number> = null,
    targetDay: Nullable<number> = null,
    ignoreDay: boolean = false
): [HotlinksReleasing, string] | NoneType {
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
    if (!isNone(targetYear) && parsedDate.year !== targetYear) {
        return;
    }
    // check if it's in current month
    if (!isNone(targetMonth) && parsedDate.month !== targetMonth) {
        return;
    }
    // check if current date is larger than parsed date
    if (!ignoreDay && !isNone(targetDay) && targetDay > parsedDate.day) {
        return;
    }
    const mangaStatus = manga.status || "ongoing";
    const dateFmt = parsedDate.toFormat("yyyy-MM-dd");
    const mangaTitle = manga.title.trim();
    let extraInfo = match.groups.ex?.trimEnd();
    if (mangaStatus === "planned" || mangaStatus === "paused") {
        extraInfo = extraInfo || "";
        // @ts-ignore
        extraInfo += ` [${mangaStatus.capitalize()}]`;
        extraInfo = extraInfo.trim();
    }
    return [
        {
            date: parsedDate,
            title: mangaTitle,
            slug: manga.slug,
            volume: Number(match.groups.vol),
            extra: extraInfo,
        },
        dateFmt,
    ];
}

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
            const result = parseMangaReleaseData(hotlink, manga, year, month, currentTime.day, ignoreDay);
            if (isNone(result)) {
                return;
            }

            const [data, dateFmt] = result;

            filteredReleases[dateFmt] = filteredReleases[dateFmt] || {};
            filteredReleases[dateFmt][data.title] = filteredReleases[dateFmt][data.title] || [];
            filteredReleases[dateFmt][data.title].push(data);
        });
    });
    return filteredReleases;
}

function sortUpcomingReleaseData(unsortedData: UpcomingReleases) {
    const temporarySortedData = Object.keys(unsortedData)
        .sort()
        .map((month) => {
            const selected = unsortedData[month];
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

function getBacklogRelease(mangas: FrontMatterManga[]) {
    const currentTime = DateTime.utc();
    // get anything that's older by 7 days
    const backlogStart = currentTime.minus({ days: 7 });
    const backloggedReelase: UpcomingReleases = {};
    mangas.forEach((manga) => {
        const { hotlinks } = manga;
        if (!Array.isArray(hotlinks)) {
            return;
        }
        if (hotlinks.length < 1) {
            return;
        }

        hotlinks.forEach((hotlink) => {
            const result = parseMangaReleaseData(hotlink, manga, null, null, null, true);
            if (isNone(result)) {
                return;
            }

            const [data, dateFmt] = result;
            const reparseDate = DateTime.fromFormat(dateFmt, "yyyy-MM-dd");
            if (reparseDate.toMillis() > backlogStart.toMillis()) {
                return;
            }

            backloggedReelase[dateFmt] = backloggedReelase[dateFmt] || {};
            backloggedReelase[dateFmt][data.title] = backloggedReelase[dateFmt][data.title] || [];
            backloggedReelase[dateFmt][data.title].push(data);
        });
    });

    return sortUpcomingReleaseData(backloggedReelase);
}

function getStartOfLastWeekOfMonth() {
    // new week start on Monday (1)
    // get current time as reference
    const currentTime = DateTime.utc();
    // last day of current month
    const finalDay = currentTime.endOf("month");

    if (finalDay.weekday === 1) {
        return finalDay.startOf("day");
    }
    // minus to get the first day of the week
    return finalDay.minus({ days: finalDay.weekday - 1 }).startOf("day");
}

function filterMonthHotlinks(mangas: FrontMatterManga[]) {
    const currentTime = DateTime.utc();
    const finalWeekStart = getStartOfLastWeekOfMonth();
    const currentMonthData = getUpcomingReleaseAtMonth(mangas, currentTime.year, currentTime.month);
    // determine if we should get next month release
    // only get if it's the final week of the month
    let filteredReleases: UpcomingReleases = { ...currentMonthData };
    // dynamically check if we should add next month section if we reach the final week of the month
    if (currentTime.day >= finalWeekStart.day) {
        let nextMonth = currentTime.month + 1;
        let targetYear = currentTime.year;
        if (nextMonth > 12) {
            nextMonth = 1;
            targetYear += 1;
        }
        const nextMonthData = getUpcomingReleaseAtMonth(mangas, targetYear, nextMonth, true);
        filteredReleases = { ...currentMonthData, ...nextMonthData };
    }

    return sortUpcomingReleaseData(filteredReleases);
}

interface StaticPropsData {
    posts: FrontMatterManga[];
}

export default function MangaIndexPage({ posts }: StaticPropsData) {
    const rippedMangaRelease = posts.filter((e) => e?.type === "rip");
    const scanMangaRelease = posts.filter((e) => e?.type === "scanlation");
    const thisMonthRelease = filterMonthHotlinks(rippedMangaRelease);
    const backloggedRelease = getBacklogRelease(rippedMangaRelease);

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
                                const parsedDt = DateTime.fromFormat(date, "yyyy-MM-dd", { zone: "UTC" });
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
                                                                        <span>
                                                                            Volume{" "}
                                                                            {rls.volume.toLocaleString()}
                                                                        </span>
                                                                        {rls.extra && (
                                                                            <span className="italic font-semibold">
                                                                                {" "}
                                                                                {rls.extra
                                                                                    .replace(/\[/, "(")
                                                                                    .replace(/\]/, ")")}
                                                                            </span>
                                                                        )}
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
                {Object.keys(backloggedRelease).length > 0 && (
                    <div className="flex flex-col mt-2 mx-auto px-4">
                        <h2 className="text-lg font-medium">Backlogged Releases</h2>
                        {Object.keys(backloggedRelease).map((date) => {
                            const monthManga = backloggedRelease[date];
                            const parsedDt = DateTime.fromFormat(date, "yyyy-MM-dd", { zone: "UTC" });
                            return (
                                <div key={`backlog-monthly-${date}`} className="flex flex-col">
                                    <h3 className="font-medium">{parsedDt.toFormat("dd MMMM yyyy")}</h3>
                                    <div className="flex flex-col flex-wrap justify-center">
                                        {Object.keys(monthManga).map((title) => (
                                            <div
                                                className="flex flex-col"
                                                key={"backlog-rls-month-" + date + "-" + title}
                                            >
                                                <h4 className="text-gray-700 dark:text-gray-300">{title}</h4>
                                                <ul className="flex flex-col flex-wrap justify-center">
                                                    {monthManga[title].map((rls) => (
                                                        <li
                                                            key={`backlog-rls-month-${date}-${title}-v${rls.volume}`}
                                                            className="pl-2 text-gray-700 dark:text-gray-300 before:content-['•_']"
                                                        >
                                                            <Link href={`/manga/${rls.slug}`} passHref>
                                                                <a className="transition text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500">
                                                                    <span>
                                                                        Volume {rls.volume.toLocaleString()}
                                                                    </span>
                                                                    {rls.extra && (
                                                                        <span className="italic font-semibold">
                                                                            {" "}
                                                                            {rls.extra
                                                                                .replace(/\[/, "(")
                                                                                .replace(/\]/, ")")}
                                                                        </span>
                                                                    )}
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
                    </div>
                )}
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
