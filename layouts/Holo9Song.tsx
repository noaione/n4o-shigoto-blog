import MetadataHead from "@/components/MetadataHead";
import { RawBlogContent } from "@/lib/mdx";
import { isNone, Nullable } from "@/lib/utils";
import Head from "next/head";
import Link from "next/link";
import React from "react";

interface ITrackMetadata {
    title: string;
    othertitle?: string;
    singer?: string;
    lyrics?: string;
    composer?: string;
    arranger?: string;
    extras?: {
        role: string;
        name: string;
    }[];
}

interface IPostExtra {
    trackNumber?: number;
    thumbfile: string;
    streamlink: string;
    nyaaid: string;
    yt_playlistid: string;
    info: ITrackMetadata;
    tracklist: string[];
}

function createDesc(trackNo?: number) {
    if (isNone(trackNo)) {
        return "Album of the Hololive IDOL PROJECT's 9 Weeks of Original Songs";
    }
    return `Song ${trackNo
        .toString()
        .padStart(2, "0")} of the Hololive IDOL PROJECT's 9 Weeks of Original Songs`;
}

function createPageTitle(trackNo?: number, title?: string) {
    if (isNone(trackNo)) {
        return `${title} (Album)`;
    }
    return `#${trackNo.toString().padStart(2, "0")} - ${title}`;
}

interface Holo9WeeksProps {
    post: RawBlogContent;
    hasPrev: boolean;
    hasNext: boolean;
}

function buildPrevLink(trackNo?: number, hasPrev?: boolean) {
    if (isNone(trackNo) || !hasPrev) {
        return undefined;
    }
    let prev = trackNo - 1;
    if (prev === 0) {
        return "/holo9weeks/album";
    }
    return `/holo9weeks/song${prev.toString().padStart(2, "0")}`;
}

function buildNextLink(trackNo?: number, hasNext?: boolean) {
    if (isNone(trackNo) || !hasNext) {
        return undefined;
    }
    return `/holo9weeks/song${(trackNo + 1).toString().padStart(2, "0")}`;
}

function NavigationLink(props: { target?: string; children: React.ReactNode }) {
    const { target, children } = props;
    if (isNone(target)) {
        return (
            <span className="flex flex-row dark:text-gray-400 items-center gap-1 mx-3 cursor-not-allowed">
                {children}
            </span>
        );
    }
    return (
        <Link href={target} passHref>
            <a className="flex flex-row items-center gap-1 mx-3 hover:underline hover:text-blue-500 transition">
                {children}
            </a>
        </Link>
    );
}

export default function LayoutHolo9Weeks(props: Holo9WeeksProps) {
    const {
        post: { frontMatter },
        hasNext,
        hasPrev,
    } = props;
    const extraData = props.post.extraData as IPostExtra;
    const { info } = extraData;

    const actualImage = `/assets/img/holo9w/${extraData.thumbfile}.jpg`;

    return (
        <>
            <Head>
                <title>{info.title} :: Holo 9 Weeks</title>
                <MetadataHead.SEO
                    title={info.title}
                    description={createDesc(extraData.trackNumber)}
                    image={actualImage}
                    urlPath={`/holo9weeks/${frontMatter.slug}`}
                />
                <MetadataHead.Prefetch extras={["https://i.ytimg.com", "https://youtube.com"]} />
                <link href="/assets/css/naoIcon.css" rel="stylesheet" />
            </Head>
            <main className="container mx-auto py-8 px-4">
                <h1 className="pb-3 text-2xl font-semibold">
                    {createPageTitle(extraData.trackNumber, info.title)}
                </h1>
                <hr className="border-black dark:border-gray-500 my-3" />
                <div className="flex flex-row gap-2 justify-center">
                    <div className="flex flex-col items-center">
                        <NavigationLink target={buildPrevLink(extraData.trackNumber, hasPrev)}>
                            <i className="naoicon font-bold">arrow_back</i>
                            <span> Previous</span>
                        </NavigationLink>
                    </div>
                    <div className="flex flex-col items-center">
                        <a
                            className="flex flex-row items-center gap-1 mx-3 hover:underline hover:text-blue-500 transition"
                            href="/holo9weeks"
                        >
                            <i className="naoicon">home</i>
                            <span> Home</span>
                        </a>
                    </div>
                    <div className="flex flex-col items-center">
                        <NavigationLink target={buildNextLink(extraData.trackNumber || 0, hasNext)}>
                            <span>Next </span>
                            <i className="naoicon font-bold">arrow_forward</i>
                        </NavigationLink>
                    </div>
                </div>
                <hr className="border-black dark:border-gray-500 my-3" />
                <div className="flex flex-col relative min-w-0 break-words bg-clip-border w-96">
                    <img className="w-full rounded-t-md" alt="Cover" src={actualImage} />
                    <div className="flex flex-col w-full p-4 mr-auto bg-gray-300 dark:bg-gray-900 rounded-b-md">
                        <h5 className="mb-2 text-xl font-medium">{info.title}</h5>
                        {info.othertitle && <h6 className="-mt-1 mb-2 text-gray-500">{info.othertitle}</h6>}
                        <p className="leading-6 mb-4">
                            {info.singer && (
                                <>
                                    <b>Singer</b>
                                    {`: ${info.singer}`}
                                    <br />
                                </>
                            )}
                            {info.lyrics && (
                                <>
                                    <b>Lyrics</b>
                                    {`: ${info.lyrics}`}
                                    <br />
                                </>
                            )}
                            {info.composer && (
                                <>
                                    <b>Composition</b>
                                    {`: ${info.composer}`}
                                    <br />
                                </>
                            )}
                            {info.arranger && (
                                <>
                                    <b>Arrangement</b>
                                    {`: ${info.arranger}`}
                                    <br />
                                </>
                            )}
                            {info.extras && (
                                <>
                                    {info.extras.map((extra, index) => {
                                        return (
                                            <React.Fragment key={`extra-${extra.role}_${index}`}>
                                                <b>{extra.role}</b>
                                                {`: ${extra.name}`}
                                                <br />
                                            </React.Fragment>
                                        );
                                    })}
                                </>
                            )}
                        </p>
                        <h6 className="mb-2 text-base font-medium leading-5">Track List</h6>
                        <p className="leading-6 mb-4">
                            {extraData.tracklist.map((track, index) => {
                                return (
                                    <React.Fragment key={`album-${info.title}-track-${index}`}>
                                        <b>{index + 1}</b>
                                        {`. ${track}`}
                                        <br />
                                    </React.Fragment>
                                );
                            })}
                        </p>
                        <div className="flex flex-row gap-2 mb-2">
                            <Link href={extraData.streamlink} passHref>
                                <a className="hover:underline font-medium text-blue-700 dark:text-blue-500 hover:text-blue-500 hover:dark:text-blue-400 transition">
                                    Buy
                                </a>
                            </Link>
                            <Link href={extraData.nyaaid} passHref>
                                <a className="hover:underline font-medium text-blue-700 dark:text-blue-500 hover:text-blue-500 hover:dark:text-blue-400 transition">
                                    Download (Torrent)
                                </a>
                            </Link>
                        </div>
                    </div>
                </div>
                <h4 className="mt-6 mb-4 text-xl font-medium">Listen</h4>
                <hr className="border-black dark:border-gray-500 my-3 w-full" />
                <div className="relative pb-[56.25%] h-0 overflow-hidden max-w-full">
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/videoseries?list=${extraData.yt_playlistid}`}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                    />
                </div>
            </main>
        </>
    );
}
