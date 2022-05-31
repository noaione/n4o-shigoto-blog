import MDXRenderer from "@/components/MDXRenderer";
import MetadataHead from "@/components/MetadataHead";
import { RawBlogContent } from "@/lib/mdx";
import { isNone, Nullable } from "@/lib/utils";
import Head from "next/head";
import Link from "next/link";
import React from "react";

interface ITrackMetadata {
    title: string;
    altTitle?: string;
    extras?: {
        role: string;
        name: string;
    }[];
}

interface IPostExtra {
    trackNumber: number;
    actualTitle?: string;
    thumbfile: string;
    info: ITrackMetadata;
}

function createPageTitle(trackNo?: number, title?: string) {
    if (isNone(trackNo)) {
        return `${title}`;
    }
    return `#${trackNo.toString().padStart(2, "0")} - ${title}`;
}

interface HoloismProps {
    post: RawBlogContent;
    hasPrev: boolean;
    hasNext: boolean;
}

function buildPrevLink(trackNo?: number, hasPrev?: boolean) {
    if (isNone(trackNo) || !hasPrev) {
        return undefined;
    }
    let prev = trackNo - 1;
    if (prev < 1) {
        return undefined;
    }
    return `/holoism/track${prev.toString().padStart(2, "0")}`;
}

function buildNextLink(trackNo?: number, hasNext?: boolean) {
    if (isNone(trackNo) || !hasNext) {
        return undefined;
    }
    return `/holoism/track${(trackNo + 1).toString().padStart(2, "0")}`;
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

const ExtraStyling = `
table.lyrics-box {
    table-layout: fixed;
    width: 100%;
    border-collapse: collapse;
}

table.lyrics-box td {
    width: 50%;
    padding: 10px;
    border-top: 0px;
}

.sp-marine {
    color: #b91111;
}

.sp-tewi {
    color: #75adfb;
}

.sp-udonge {
    color: #944488;
}

.sp-alice {
    color: #CF7BFD;
}

.sp-patchouli {
    color: #378883;
}

.sp-marisa {
    color: #828282;
}

.sp-marisa {
    color: #828282;
}

.sp-cirno {
    color: #62C1FE;
}

.sp-remilia {
    color: #A981CE;
}

.sp-yukari {
    color: #E5AE3D;
}

.sp-yuyuko {
    color: #ABB3CC;
}

.song-marine {
    color: #a53c3c;
}

.song-peko {
    color: #87bed8;
}

.song-miko {
    color: #eca2c0;
}

.song-pekomiko {
    color: #ac94cc;
}

.song-flare {
    color: #ef8a5a;
}

.song-all {
    color: #000
}

`;

export default function LayoutHoloism(props: HoloismProps) {
    const {
        post: { frontMatter, mdxSource },
        hasNext,
        hasPrev,
    } = props;
    const extraData = props.post.extraData as IPostExtra;
    const { info } = extraData;

    const actualImage = `/assets/img/holoism_cover.jpg`;

    let actualDesc = info.title;
    if (!frontMatter.title.startsWith("Episode")) {
        actualDesc = `Lyrics for ${info.title} by ${info.altTitle}`;
    }

    return (
        <>
            <Head>
                <title>{frontMatter.title} :: Holoism</title>
                <MetadataHead.SEO
                    title={frontMatter.title}
                    description={actualDesc}
                    image={actualImage}
                    urlPath={`/holoism/${frontMatter.slug}`}
                    smallImage
                />
                <MetadataHead.Prefetch
                    extras={["https://i.ytimg.com", "https://youtube.com", "https://img.dlsite.jp"]}
                />
                <link href="/assets/css/naoIcon.css" rel="stylesheet" />
                <style>{ExtraStyling}</style>
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
                            href="/holoism"
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
                        <h5 className="mb-2 text-xl font-medium">{frontMatter.title}</h5>
                        {info.altTitle && <h6 className="-mt-1 mb-2 text-gray-500">{info.altTitle}</h6>}
                        <p className="leading-6 mb-4">
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

                        <div className="flex flex-row gap-2 mb-2">
                            <Link href="http://cool-create.cc/cd/cccd60/" passHref>
                                <a className="hover:underline font-medium text-blue-700 dark:text-blue-500 hover:text-blue-500 hover:dark:text-blue-400 transition">
                                    Buy
                                </a>
                            </Link>
                        </div>
                    </div>
                </div>
                <div id="complex-section">
                    <MDXRenderer mdxSource={mdxSource} />
                </div>
            </main>
        </>
    );
}
