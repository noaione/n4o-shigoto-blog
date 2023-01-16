import MetadataHead from "@/components/MetadataHead";
import type { RawBlogContent } from "@/lib/mdx";
import { isNone, kebabCase, Nullable } from "@/lib/utils";
import Head from "next/head";
import Link from "next/link";
import React from "react";

import { unified } from "unified";

import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

import * as ExternalIcons from "@/components/Icons/External";
import imagePlaceholder from "../public/assets/img/cover-placeholder.png";

function renderMarkdown(md: string) {
    const result = unified().use(remarkParse).use(remarkGfm).use(remarkHtml).processSync(md);
    return result.toString();
}

interface HotlinkProps {
    url: string;
    title?: string;
}

function UnknownIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="beside-link-icon !rounded-full"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
            />
        </svg>
    );
}

function LinkIconRender(props: HotlinkProps) {
    const { url, title: titleTop } = props;
    const iconDataset = {
        "sevenseasentertainment.com": {
            icon: (
                <img
                    alt="Seven Seas Icon"
                    className="beside-link-icon"
                    src={ExternalIcons.IconSevenSeas.src}
                />
            ),
            title: "Seven Seas Entertainment",
        },
        "kodansha.us": {
            icon: (
                <img alt="Kodansha Icon" className="beside-link-icon" src={ExternalIcons.IconKodansha.src} />
            ),
            title: "Kodansha",
        },
        "yenpress.com": {
            icon: (
                <img
                    alt="Yen Press Icon"
                    className="beside-link-icon !rounded-full"
                    src={ExternalIcons.IconYenPress.src}
                />
            ),
            title: "Yen Press",
        },
        "comikey.com": {
            icon: <img alt="Comikey Icon" className="beside-link-icon" src={ExternalIcons.IconComikey.src} />,
            title: "Comikey",
        },
        "j-novel.club": {
            icon: (
                <img
                    alt="J-Novel Club Icon"
                    className="beside-link-icon"
                    src={ExternalIcons.IconJNovelClub.src}
                />
            ),
            title: "J-Novel Club",
        },
        "squareenixmangaandbooks.square-enix-games.com": {
            icon: (
                <img
                    alt="Square Enix Icon"
                    className="beside-link-icon"
                    src={ExternalIcons.IconSquareEnix.src}
                />
            ),
            title: "Square Enix Manga",
        },
        "nyaa.si": {
            icon: <img alt="Nyaa.si Icon" className="beside-link-icon" src={ExternalIcons.IconNyaa.src} />,
            title: "Nyaa",
        },
        "perpusindo.info": {
            icon: (
                <img
                    alt="PerpusIndo Icon"
                    className="beside-link-icon"
                    src={ExternalIcons.IconPerpusIndo.src}
                />
            ),
            title: "PerpusIndo",
        },
        "mega.nz": {
            icon: (
                <img
                    alt="Mega.nz Icon"
                    className="beside-link-icon !rounded-full"
                    src={ExternalIcons.IconMegaNZ.src}
                />
            ),
            title: "MEGA",
        },
        "mangaupdates.com": {
            icon: (
                <img
                    alt="MangaUpdates Icon"
                    className="beside-link-icon"
                    src={ExternalIcons.IconMangaUpdates.src}
                />
            ),
            title: "MangaUpdates",
        },
        "novelupdates.com": {
            icon: (
                <img
                    alt="NovelUpdates Icon"
                    className="beside-link-icon"
                    src={ExternalIcons.IconNovelUpdates.src}
                />
            ),
            title: "Novel Updates",
        },
        "mangadex.org": {
            icon: (
                <img
                    alt="MangaDex Icon"
                    className="beside-link-icon !rounded-full"
                    src={ExternalIcons.IconMangaDex.src}
                />
            ),
            title: "MangaDex",
        },
        "amazon.com": {
            icon: <img alt="Amazon Icon" className="beside-link-icon" src={ExternalIcons.IconAmazon.src} />,
            title: "Amazon",
        },
        "amazon.co.jp": {
            icon: <img alt="Amazon Icon" className="beside-link-icon" src={ExternalIcons.IconAmazon.src} />,
            title: "Amazon Japan",
        },
        "play.google.com": {
            icon: (
                <img
                    alt="Play Books Icon"
                    className="beside-link-icon"
                    src={ExternalIcons.IconPlayBooks.src}
                />
            ),
            title: "Play Books",
        },
        "#": {
            icon: <UnknownIcon />,
            title: "Unknown",
        },
    };

    let urlDomain = "#";
    if (url !== "#") {
        urlDomain = url.split("//")[1].split("/")[0];
        if (urlDomain.startsWith("www.")) {
            urlDomain = urlDomain.substring(4);
        }
    }
    const IconData = iconDataset[urlDomain as keyof typeof iconDataset];
    if (isNone(IconData)) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mr-1 text-[15px] font-medium text-gray-700 dark:text-gray-300 leading-6 transition hover:text-emerald-600 dark:hover:text-emerald-500"
            >
                {titleTop || "Unknown Link"}
            </a>
        );
    }
    const { icon, title } = IconData;
    return (
        <div className="flex flex-row items-center">
            {icon}
            <a
                className="mr-1 ml-2 text-[15px] font-medium text-gray-700 dark:text-gray-300 leading-6 transition hover:text-emerald-600 dark:hover:text-emerald-500"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
            >
                {titleTop || title}
            </a>
        </div>
    );
}

type ProjectStatus = "ongoing" | "dropped" | "finished" | "paused" | "planned" | "cancelled";

function ProjectStatusRender(props: { status: ProjectStatus }) {
    const { status } = props;
    const statusMap = {
        ongoing: { key: "Ongoing", color: "text-gray-600 dark:text-gray-400" },
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
    return <span className={`${statusInfo.color} text-sm font-semibold`}>{statusInfo.key}</span>;
}

function isDigit(str: string | number): boolean {
    if (typeof str === "number") {
        return true;
    }
    return /^\d+$/.test(str);
}

interface AuthorProps {
    role: string;
    name: string;
}

function AuthorRender(props: { author: AuthorProps | string }) {
    const { author } = props;
    if (typeof author === "string") {
        return (
            <p className="text-sm text-center md:text-left">
                <span className="font-semibold">Story &amp; Art</span>
                <br />
                <span className="text-gray-700 dark:text-gray-300 leading-6">{author}</span>
            </p>
        );
    }
    return (
        <p className="text-sm text-center md:text-left">
            <span className="font-semibold">{author.role}</span>
            <br />
            <span className="text-gray-700 dark:text-gray-300 leading-6">{author.name}</span>
        </p>
    );
}

function processDescription(synopsis: string): string {
    // strip markdown?
    // remove single newline, replace double newline with single one
    let lines = synopsis.replace(/\n\n/g, "\\DOUBLENEWLINE");
    lines = lines.replace(/\n/g, " ");
    lines = lines.replace(/\\DOUBLENEWLINE/g, "\n\n");
    return lines;
}

interface MangaInfoLink {
    mu?: string;
    mangadex?: string;
    official?: string;
    raw?: string;
    nu?: string;
    amazon?: string;
    amazonJP?: string;
    playbooks?: string;
}

interface ExtraData {
    synopsis?: string;
    authors: (AuthorProps | string)[];
    otherTitles?: string[];
    infolinks?: MangaInfoLink;
    hotlinks?: (Partial<HotlinkProps> | string)[];
    status?: ProjectStatus;
    publicationStatus?: ProjectStatus;
}

interface MangaLayoutProps {
    post: RawBlogContent;
}

export default class LayoutMangaIndex extends React.Component<MangaLayoutProps> {
    constructor(props: MangaLayoutProps) {
        super(props);
    }

    render(): React.ReactNode {
        const {
            post: { frontMatter, mdxSource },
        } = this.props;

        const extraData = this.props.post.extraData as ExtraData;

        let firstImage: Nullable<string> = null;
        if (Array.isArray(frontMatter.images) && frontMatter.images.length > 0) {
            firstImage = frontMatter.images[0];
        }

        const synopsis = extraData?.synopsis || "*No synopsis*";
        const synopsisForDesc = extraData?.synopsis || `Manga releases of ${frontMatter.title}`;

        const { hotlinks, otherTitles, infolinks } = extraData;
        const projectStatus = extraData?.status || "ongoing";
        const publicationStatus = extraData?.publicationStatus || "ongoing";

        let hasAnyInfoLinks = false;
        if (!isNone(infolinks) && (infolinks.mu || infolinks.mangadex || infolinks.official)) {
            hasAnyInfoLinks = true;
        }

        return (
            <>
                <Head>
                    <title>{frontMatter.title} :: Manga Index - Shigoto</title>
                    <MetadataHead.SEO
                        title={frontMatter.title}
                        description={processDescription(synopsisForDesc)}
                        htmlDescription={`Manga releases of ${frontMatter.title}`}
                        image={firstImage}
                        urlPath={`/manga/${frontMatter.slug}`}
                        siteName="nao Manga"
                        smallImage
                    />
                    <MetadataHead.Prefetch
                        extras={[
                            // jnc
                            "https://j-novel.club",
                            // 7seas
                            "https://sevenseasentertainment.com",
                            // kodansha
                            "https://kodansha.us",
                            // yen press
                            "https://yenpress.com",
                            // yen press cdn
                            "https://yenpress-us.imgix.net",
                            // comikey
                            "https://comikey.com",
                            // square enix
                            "https://fyre.cdn.sewest.net",
                            // wp media resizer
                            "https://i1.wp.com",
                            // play books cdn
                            "https://books.google.com",
                            // cloudfront cdn (jnc/yp)
                            "https://d2dq7ifhe7bu0f.cloudfront.net",
                            "https://dhjhkxawhe8q4.cloudfront.net",
                            // mangadex
                            "https://mangadex.org",
                            // amazon
                            "https://m.media-amazon.com",
                        ]}
                    />
                </Head>
                <main className="pt-2 pb-8">
                    <div className="flex flex-col justify-center md:justify-start md:flex-row mt-4 mx-4 align-middle">
                        <div className="flex justify-center">
                            <Link href="/manga" passHref>
                                <a className="text-2xl font-light w-fit rounded-full border-2 border-emerald-600 select-none text-emerald-500 dark:border-emerald-500 dark:text-emerald-400 mx-1 items-center px-1 hover:opacity-80 transition-opacity">
                                    立
                                </a>
                            </Link>
                        </div>

                        <div className="text-xl text-center font-semibold select-none mt-2 md:mt-1 md:mx-2">
                            {frontMatter.title}
                        </div>
                    </div>
                    <div id="cover-img" className="flex flex-row mt-4 mx-4 justify-center md:justify-start">
                        {firstImage && (
                            <div className="xs:w-64 md:w-72 lg:w-96">
                                <img
                                    className="w-full rounded-md md:hover:-translate-y-1 md:transition-transform"
                                    alt="Cover"
                                    src={firstImage}
                                    onError={(e) => {
                                        e.currentTarget.src = imagePlaceholder.src;
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {Array.isArray(otherTitles) && otherTitles.length > 0 && (
                        <div
                            id="other-titles"
                            className="flex flex-col items-center md:items-start mt-4 mx-4 max-w-[65ch]"
                        >
                            <h3 className="mb-2 font-semibold">Also Known As</h3>
                            {otherTitles.map((title, idx) => (
                                <p
                                    key={`othertitle-${idx}`}
                                    className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm leading-6 md:before:content-['-_']"
                                >
                                    {title}
                                </p>
                            ))}
                        </div>
                    )}

                    <div
                        id="author-info"
                        className="flex flex-row flex-wrap gap-3 md:gap-4 justify-center md:justify-start mt-4 mx-4 max-w-[65ch]"
                    >
                        {extraData.authors.map((author, idx) => {
                            let authorId = `author-${idx}`;
                            if (typeof author === "string") {
                                authorId = authorId + "-" + kebabCase(author.toLowerCase());
                            } else {
                                authorId = authorId + "-" + kebabCase(author.role.toLowerCase());
                            }
                            return <AuthorRender key={authorId} author={author} />;
                        })}
                    </div>

                    <div
                        id="project-status"
                        className="flex flex-row flex-wrap gap-3 md:gap-4 justify-center md:justify-start mt-4 mx-4 max-w-[65ch]"
                    >
                        <div className="text-sm text-center md:text-left">
                            <h3 className="mb-1 font-semibold text-base">Status</h3>
                            <ProjectStatusRender key="project-status" status={projectStatus} />
                        </div>
                        <div className="text-sm text-center md:text-left">
                            <h3 className="mb-1 font-semibold text-base">Publication Status</h3>
                            <ProjectStatusRender key="pub-project-status" status={publicationStatus} />
                        </div>
                    </div>

                    <div id="synopsis" className="flex flex-col items-center md:items-start mt-4 mx-4">
                        <div
                            key="synopsis-render"
                            className="text-center md:text-left prose-manga-synopsis"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(synopsis) }}
                        />
                    </div>

                    {!isNone(infolinks) && hasAnyInfoLinks && (
                        <div id="info-links" className="flex flex-col items-center md:items-start mt-4 mx-4">
                            <h3 className="mb-2 font-semibold">Links</h3>
                            <div className="flex flex-col gap-2">
                                {infolinks.mu && (
                                    <LinkIconRender
                                        key="mangaupdates-link"
                                        url={
                                            isDigit(infolinks.mu)
                                                ? `https://www.mangaupdates.com/series.html?id=${infolinks.mu}`
                                                : `https://www.mangaupdates.com/series/${infolinks.mu}`
                                        }
                                    />
                                )}
                                {infolinks.nu && (
                                    <LinkIconRender
                                        key="novelupdates-link"
                                        url={
                                            isDigit(infolinks.nu)
                                                ? `https://www.novelupdates.com/?p=${infolinks.nu}`
                                                : `https://www.novelupdates.com/series/${infolinks.nu}`
                                        }
                                    />
                                )}
                                {infolinks.mangadex && (
                                    <LinkIconRender
                                        key="mangadex-link"
                                        url={`https://mangadex.org/title/${infolinks.mangadex}`}
                                    />
                                )}
                                {infolinks.official && (
                                    <LinkIconRender key="official-link" url={infolinks.official} />
                                )}
                                {infolinks.amazon && (
                                    <LinkIconRender
                                        key="amazon-link"
                                        url={`https://amazon.com/dp/${infolinks.amazon}`}
                                    />
                                )}
                                {infolinks.amazonJP && (
                                    <LinkIconRender
                                        key="amazon-jp-link"
                                        url={`https://amazon.co.jp/dp/${infolinks.amazonJP}`}
                                    />
                                )}
                                {infolinks.playbooks && (
                                    <LinkIconRender
                                        key="google-play-books-link"
                                        url={`https://play.google.com/store/books/details?id=${infolinks.playbooks}`}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {Array.isArray(hotlinks) && hotlinks.length > 0 && (
                        <div
                            id="download-links"
                            className="flex flex-col items-center md:items-start mt-4 mx-4"
                        >
                            <h3 className="mb-2 font-semibold">{`Download${
                                hotlinks.length > 1 ? "s" : ""
                            }`}</h3>
                            <div className="flex flex-col gap-2">
                                {hotlinks.map((hotlink, idx) => {
                                    let hotlinkId = `hotlink-${idx}`;
                                    if (typeof hotlink === "string") {
                                        hotlinkId = hotlinkId + "-" + kebabCase(hotlink.toLowerCase());
                                        return <LinkIconRender key={hotlinkId} url={hotlink} />;
                                    } else {
                                        const actualUrl = hotlink.url;
                                        const actualTitle = hotlink.title;
                                        if (isNone(actualUrl) && isNone(actualTitle)) {
                                            return null;
                                        }
                                        if (!isNone(actualTitle) && isNone(actualUrl)) {
                                            return (
                                                <div key={hotlinkId} className="flex flex-row items-center">
                                                    <UnknownIcon />
                                                    <p className="ml-2 mr-1 text-[15px] select-none font-medium text-gray-700 dark:text-gray-300 leading-6 transition cursor-not-allowed">
                                                        {actualTitle}
                                                    </p>
                                                </div>
                                            );
                                        } else if (!isNone(actualUrl)) {
                                            const useThis = actualUrl || actualTitle;
                                            hotlinkId =
                                                hotlinkId +
                                                "-" +
                                                kebabCase((useThis as string).toLowerCase());
                                            return (
                                                <LinkIconRender
                                                    key={hotlinkId}
                                                    url={actualUrl}
                                                    title={actualTitle}
                                                />
                                            );
                                        }
                                    }
                                })}
                            </div>
                        </div>
                    )}
                </main>
            </>
        );
    }
}
