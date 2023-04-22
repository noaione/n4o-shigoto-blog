import React, { useState } from "react";
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
type ExtendedProjectStatus = ProjectStatus | "complete" | "completed" | "hiatus";
const FINISHEDSTATUS = ["finished", "complete", "completed"] as ExtendedProjectStatus[];
const ONHOLDSTATUS = ["paused", "hiatus"] as ExtendedProjectStatus[];
const DEFAULTSTATUS = [
    // Ongoing
    "ongoing",
    // Finished
    "finished",
    "complete",
    "completed",
    // Paused/On Hold/Hiatus
    "paused",
    "hiatus",
    // Planned
    "planned",
    // Cancelled
    "cancelled",
    // Dropped
    "dropped",
] as ExtendedProjectStatus[];

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
    status?: ProjectStatus;
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
    ignoreDay = false
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
            status: manga.status,
        },
        dateFmt,
    ];
}

function getUpcomingReleaseAtMonth(
    mangas: FrontMatterManga[],
    allowStatus: ExtendedProjectStatus[] = DEFAULTSTATUS,
    year: number,
    month: number,
    ignoreDay = false
) {
    const filteredReleases: UpcomingReleases = {};
    const currentTime = DateTime.utc();
    mangas.forEach((manga) => {
        const { hotlinks, status } = manga;
        if (!Array.isArray(hotlinks)) {
            return;
        }
        if (hotlinks.length < 1) {
            return;
        }
        const stat = status || "ongoing";
        if (allowStatus.indexOf(stat) < 0) {
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

function getBacklogRelease(mangas: FrontMatterManga[], allowStatus: ExtendedProjectStatus[] = DEFAULTSTATUS) {
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
        const stat = manga.status || "ongoing";
        if (allowStatus.indexOf(stat) < 0) {
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

function filterMonthHotlinks(
    mangas: FrontMatterManga[],
    allowStatus: ExtendedProjectStatus[] = DEFAULTSTATUS,
    forceNextMonth = false
): [UpcomingReleases, boolean] {
    const currentTime = DateTime.utc();
    const finalWeekStart = getStartOfLastWeekOfMonth();
    const lastDayOfTheMonth = currentTime.endOf("month");
    const prevWeekStartDay = finalWeekStart.minus({ days: 1 }).startOf("week");
    const currentMonthData = getUpcomingReleaseAtMonth(
        mangas,
        allowStatus,
        currentTime.year,
        currentTime.month
    );
    // determine if we should get next month release
    // only get if it's the final week of the month
    let filteredReleases: UpcomingReleases = { ...currentMonthData };
    // dynamically check if we should add next month section if we reach the final week of the month
    // also ignore if we're forcing next month, and also if the final week start is Monday.
    const isPreviousWeekPast = currentTime.day >= prevWeekStartDay.day;
    const lastWeekAlready =
        currentTime.day >= finalWeekStart.day || (lastDayOfTheMonth.weekday === 1 && isPreviousWeekPast);
    if (lastWeekAlready || forceNextMonth) {
        let nextMonth = currentTime.month + 1;
        let targetYear = currentTime.year;
        if (nextMonth > 12) {
            nextMonth = 1;
            targetYear += 1;
        }
        const nextMonthData = getUpcomingReleaseAtMonth(mangas, allowStatus, targetYear, nextMonth, true);
        filteredReleases = { ...currentMonthData, ...nextMonthData };
    }

    return [sortUpcomingReleaseData(filteredReleases), lastWeekAlready];
}

function ProjectStatusInfo(props: { status: ProjectStatus; className?: string }) {
    const { status, className } = props;
    const statusMap = {
        ongoing: { key: "Ongoing", color: "text-green-600 dark:text-green-400" },
        dropped: { key: "Dropped", color: "text-red-600 dark:text-red-400" },
        finished: { key: "Finished", color: "text-teal-600 dark:text-teal-400" },
        complete: { key: "Completed", color: "text-teal-600 dark:text-teal-400" },
        completed: { key: "Completed", color: "text-teal-600 dark:text-teal-400" },
        paused: { key: "On Hold", color: "text-orange-600 dark:text-orange-400" },
        hiatus: { key: "On Hiatus", color: "text-orange-600 dark:text-orange-400" },
        planned: { key: "Planned", color: "text-blue-600 dark:text-blue-400" },
        cancelled: { key: "Cancelled", color: "text-pink-600 dark:text-pink-400" },
    };
    const statusInfo = statusMap[status] || statusMap.ongoing;
    const actualClassName = className || "";
    return (
        <span
            className={`select-none font-semibold ${statusInfo.color} ${actualClassName}`}
            data-status={statusInfo.key}
        >
            •
        </span>
    );
}

function StatusPillInfo(props: {
    status: ProjectStatus;
    onClick?: (status: ProjectStatus, currentStatus: boolean) => void;
}) {
    const [isEnabled, setIsEnabled] = useState(false);
    const { status, onClick: onPillClick } = props;
    const statusMap = {
        ongoing: {
            key: "Ongoing",
            color: "border-green-600 dark:border-green-400 hover:bg-green-600 dark:hover:bg-green-400",
            colorBg: "bg-green-600 dark:bg-green-400",
        },
        dropped: {
            key: "Dropped",
            color: "border-red-600 dark:border-red-400 hover:bg-red-600 dark:hover:bg-red-400",
            colorBg: "bg-red-600 dark:bg-red-400",
        },
        finished: {
            key: "Finished",
            color: "border-teal-600 dark:border-teal-400 hover:bg-teal-600 dark:hover:bg-teal-400",
            colorBg: "bg-teal-600 dark:bg-teal-400",
        },
        complete: {
            key: "Completed",
            color: "border-teal-600 dark:border-teal-400 hover:bg-teal-600 dark:hover:bg-teal-400",
            colorBg: "bg-teal-600 dark:bg-teal-400",
        },
        completed: {
            key: "Completed",
            color: "border-teal-600 dark:border-teal-400 hover:bg-teal-600 dark:hover:bg-teal-400",
            colorBg: "bg-teal-600 dark:bg-teal-400",
        },
        paused: {
            key: "On Hold",
            color: "border-orange-600 dark:border-orange-400 hover:bg-orange-600 dark:hover:bg-orange-400",
            colorBg: "bg-orange-600 dark:bg-orange-400",
        },
        hiatus: {
            key: "On Hiatus",
            color: "border-orange-600 dark:border-orange-400 hover:bg-orange-600 dark:hover:bg-orange-400",
            colorBg: "bg-orange-600 dark:bg-orange-400",
        },
        planned: {
            key: "Planned",
            color: "border-blue-600 dark:border-blue-400 hover:bg-blue-600 dark:hover:bg-blue-400",
            colorBg: "bg-blue-600 dark:bg-blue-400",
        },
        cancelled: {
            key: "Cancelled",
            color: "border-pink-600 dark:border-pink-400 hover:bg-pink-600 dark:hover:bg-pink-400",
            colorBg: "bg-pink-600 dark:bg-pink-400",
        },
    };
    const statusInfo = statusMap[status] || statusMap.ongoing;
    return (
        <button
            className={`group flex flex-col items-center rounded-xl px-2 py-1 border-[1px] ${
                statusInfo.color
            } ${isEnabled ? statusInfo.colorBg : ""} duration-250 transition-colors`}
            onClick={() => {
                onPillClick?.(status, isEnabled);
                setIsEnabled((prev) => !prev);
            }}
        >
            <ProjectStatusInfo
                status={status}
                className={`${
                    isEnabled ? "!text-white dark:!text-black" : ""
                } group-hover:text-white dark:group-hover:text-black`}
            />
            <p
                className={`text-sm font-semibold uppercase select-none ${
                    isEnabled ? "text-white dark:text-black" : "text-gray-800 dark:text-gray-200"
                } tracking-wide group-hover:text-white dark:group-hover:text-black`}
            >
                {statusInfo.key}
            </p>
        </button>
    );
}

function UpcomingReleaseRender(props: { releases: UpcomingReleases; prependKey?: string }) {
    const { releases, prependKey } = props;
    const prepKey = prependKey || "upcoming";
    return Object.keys(releases).length > 0 ? (
        <>
            {Object.keys(releases).map((date) => {
                const monthManga = releases[date];
                const parsedDt = DateTime.fromFormat(date, "yyyy-MM-dd", { zone: "UTC" });
                return (
                    <div key={`${prepKey}-monthly-${date}`} className="flex flex-col">
                        <h3 className="font-medium">{parsedDt.toFormat("dd MMMM yyyy")}</h3>
                        <div className="flex flex-col flex-wrap justify-center">
                            {Object.keys(monthManga).map((title) => (
                                <div
                                    className="flex flex-col"
                                    key={`${prepKey}-rls-monthly-${date}-${title}`}
                                >
                                    <h4 className="text-gray-700 dark:text-gray-300">
                                        {title}
                                        <ProjectStatusInfo
                                            status={monthManga[title][0].status || "ongoing"}
                                            className="ml-1"
                                        />
                                    </h4>
                                    <ul className="flex flex-col flex-wrap justify-center">
                                        {monthManga[title].map((rls) => (
                                            <li
                                                key={`${prepKey}-rls-month-${date}-${title}-v${rls.volume}`}
                                                className="pl-2 text-gray-700 dark:text-gray-300 before:content-['•_']"
                                            >
                                                <Link
                                                    href={`/manga/${rls.slug}`}
                                                    className="transition text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500"
                                                >
                                                    <span>Volume {rls.volume.toLocaleString()}</span>
                                                    {rls.extra && (
                                                        <span className="italic font-semibold">
                                                            {" "}
                                                            {rls.extra.replace(/\[/, "(").replace(/\]/, ")")}
                                                        </span>
                                                    )}
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
    );
}

function filterReleaseByStatus(frontMatter: FrontMatterManga[], statuses: ExtendedProjectStatus[]) {
    return frontMatter.filter((e) => statuses.includes(e.status || "ongoing"));
}

function isSameArray<T>(a: T[], b: T[]) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
}

interface StaticPropsData {
    posts: FrontMatterManga[];
}

export default function MangaIndexPage({ posts }: StaticPropsData) {
    const [showNextMonth, setShowNextMonth] = useState(false);
    const [enabledStatuses, setEnabledStatuses] = useState<ExtendedProjectStatus[]>(DEFAULTSTATUS);
    const rippedMangaRelease = posts.filter((e) => e?.type === "rip");
    const scanMangaRelease = posts.filter((e) => e?.type === "scanlation");
    const [thisMonthRelease, isLastWeek] = filterMonthHotlinks(
        rippedMangaRelease,
        enabledStatuses,
        showNextMonth
    );
    const backloggedRelease = getBacklogRelease(rippedMangaRelease, enabledStatuses);
    const actualRippedMangaRelease = filterReleaseByStatus(rippedMangaRelease, enabledStatuses);
    const actualScanMangaRelease = filterReleaseByStatus(scanMangaRelease, enabledStatuses);

    const callbackFilterStatus = (stat: ExtendedProjectStatus, isEnabled: boolean) => {
        let extendArray = [] as ExtendedProjectStatus[];
        if (FINISHEDSTATUS.includes(stat)) {
            extendArray = FINISHEDSTATUS;
        } else if (ONHOLDSTATUS.includes(stat)) {
            extendArray = ONHOLDSTATUS;
        } else {
            extendArray = [stat];
        }
        if (isSameArray(enabledStatuses, DEFAULTSTATUS)) {
            if (!isEnabled) {
                setEnabledStatuses(extendArray);
            } else {
                // assume that everything is enabled manually.
                // so remove this
                setEnabledStatuses((prev) => prev.filter((e) => !extendArray.includes(e)));
            }
        } else {
            if (isEnabled) {
                // remove
                setEnabledStatuses((prev) => {
                    const newStat = prev.filter((e) => !extendArray.includes(e));
                    if (newStat.length === 0) {
                        return DEFAULTSTATUS;
                    }
                    return newStat;
                });
            } else {
                // add
                setEnabledStatuses([...enabledStatuses, ...extendArray]);
            }
        }
    };

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
                <Link
                    href="/"
                    className="mt-2 mx-auto px-4 text-lg font-medium hover:text-red-500 transition"
                >
                    🏠 Home
                </Link>
                <div className="flex flex-row mt-2 px-3 justify-center lg:justify-start gap-2 flex-wrap">
                    <StatusPillInfo status="ongoing" onClick={callbackFilterStatus} />
                    <StatusPillInfo status="dropped" onClick={callbackFilterStatus} />
                    <StatusPillInfo status="finished" onClick={callbackFilterStatus} />
                    <StatusPillInfo status="paused" onClick={callbackFilterStatus} />
                    <StatusPillInfo status="planned" onClick={callbackFilterStatus} />
                    <StatusPillInfo status="cancelled" onClick={callbackFilterStatus} />
                </div>
                <div className="flex flex-col mt-2 mx-auto px-4">
                    <div className="flex">
                        <h2 className="text-lg font-medium">Upcoming Releases</h2>
                    </div>
                    <UpcomingReleaseRender releases={thisMonthRelease} />
                </div>
                {!isLastWeek && (
                    <div className="flex flex-col mt-2 mx-auto px-2">
                        <p>
                            <button
                                className="text-sm rounded-md text-emerald-600 dark:text-emerald-400 transition-opacity hover:opacity-80 ml-1 flex flex-row items-center"
                                onClick={() => {
                                    setShowNextMonth((prev) => !prev);
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className={`w-5 h-5 ${showNextMonth ? "rotate-180" : "rotate-0"}`}
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="ml-1 font-medium">
                                    {showNextMonth ? "Hide Next Month" : "Show Next Month"}
                                </span>
                            </button>
                        </p>
                    </div>
                )}
                {Object.keys(backloggedRelease).length > 0 && (
                    <div className="flex flex-col mt-2 mx-auto px-4">
                        <h2 className="text-lg font-medium">Backlogged Releases</h2>
                        <UpcomingReleaseRender releases={backloggedRelease} />
                    </div>
                )}
                <div className="flex flex-col mt-2 mx-auto px-4">
                    <h2 className="text-lg font-medium">Ripped Release</h2>
                    {actualRippedMangaRelease.length > 0 ? (
                        actualRippedMangaRelease.map((r) => {
                            return (
                                <div className="flex" key={`rip-rls-${r.slug}`}>
                                    <Link href={`/manga/${r.slug}`} className="transition hover:text-red-500">
                                        <ProjectStatusInfo status={r.status || "ongoing"} /> {r.title}
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
                    {actualScanMangaRelease.length > 0 ? (
                        actualScanMangaRelease.map((r) => {
                            return (
                                <div className="flex" key={`scanlation-rls-${r.slug}`}>
                                    <Link href={`/manga/${r.slug}`} className="transition hover:text-red-500">
                                        • {r.title}
                                    </Link>
                                    <ProjectStatusInfo status={r.status || "ongoing"} />
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
