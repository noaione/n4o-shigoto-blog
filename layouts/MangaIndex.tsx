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

function renderMarkdown(md: string) {
    const result = unified().use(remarkParse).use(remarkGfm).use(remarkHtml).processSync(md);
    return result.toString();
}

interface HotlinkProps {
    url: string;
    title?: string;
}

function LinkIconRender(props: HotlinkProps) {
    const { url, title: titleTop } = props;
    const iconDataset = {
        "sevenseasentertainment.com": {
            icon: (
                <img
                    alt="Seven Seas Icon"
                    className="beside-link-icon"
                    src="https://sevenseasentertainment.com/wp-content/uploads/2017/04/cropped-SS-1-192x192.jpg"
                />
            ),
            title: "Seven Seas Entertainment",
        },
        "kodansha.us": {
            icon: (
                <img
                    alt="Kodansha Icon"
                    className="beside-link-icon"
                    src="https://kodansha.us/apple-touch-icon.png"
                />
            ),
            title: "Kodansha",
        },
        "yenpress.com": {
            icon: (
                <img
                    alt="Yen Press Icon"
                    className="beside-link-icon !rounded-full"
                    src="https://dhjhkxawhe8q4.cloudfront.net/yenpress-wp/wp-content/uploads/2018/12/11131202/android-icon-192x192.png"
                />
            ),
            title: "Yen Press",
        },
        "comikey.com": {
            icon: (
                <img
                    alt="Comikey Icon"
                    className="beside-link-icon"
                    src="https://comikey.com/static/images/favicons/favicon.png"
                />
            ),
            title: "Comikey",
        },
        "j-novel.club": {
            icon: (
                <img
                    alt="J-Novel Club Icon"
                    className="beside-link-icon"
                    src="https://j-novel.club/apple-touch-icon.png"
                />
            ),
            title: "J-Novel Club",
        },
        "nyaa.si": {
            icon: (
                <img
                    alt="Nyaa.si Icon"
                    className="beside-link-icon"
                    src="https://nyaa.si/static/img/avatar/default.png"
                />
            ),
            title: "Nyaa",
        },
        "perpusindo.info": {
            icon: (
                <img
                    alt="PerpusIndo Icon"
                    className="beside-link-icon"
                    src="https://www.perpusindo.info/apple-touch-icon.png"
                />
            ),
            title: "PerpusIndo",
        },
        "mega.nz": {
            icon: (
                <img
                    alt="Mega Icon"
                    className="beside-link-icon !rounded-full"
                    src="https://mega.nz/android-chrome-192x192.png"
                />
            ),
            title: "MEGA",
        },
        "mangaupdates.com": {
            icon: (
                <img
                    alt="MangaUpdates Icon"
                    className="beside-link-icon"
                    src="https://www.mangaupdates.com/images/manga-updates.svg"
                />
            ),
            title: "MangaUpdates",
        },
        "mangadex.org": {
            icon: (
                <img
                    alt="MangaDex Icon"
                    className="beside-link-icon !rounded-full"
                    src="https://mangadex.org/icon-192.png"
                />
            ),
            title: "MangaDex",
        },
    };

    let urlDomain = url.split("//")[1].split("/")[0];
    if (urlDomain.startsWith("www.")) {
        urlDomain = urlDomain.substring(4);
    }
    const IconData = iconDataset[urlDomain as keyof typeof iconDataset];
    if (isNone(IconData)) {
        return <a href={url}>{titleTop || "Unknown Link"}</a>;
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

type ProjectStatus = "ongoing" | "dropped" | "finished" | "paused";

function ProjectStatusRender(props: { status: ProjectStatus }) {
    const { status } = props;
    const statusMap = {
        ongoing: { key: "Ongoing", color: "text-gray-600 dark:text-gray-400" },
        dropped: { key: "Dropped", color: "text-red-600 dark:text-red-400" },
        finished: { key: "Finished", color: "text-green-600 dark:text-green-400" },
        paused: { key: "On Hold", color: "text-orange-600 dark:text-orange-400" },
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

interface MangaInfoLink {
    mu?: string;
    mangadex?: string;
    official?: string;
    raw?: string;
}

interface ExtraData {
    synopsis?: string;
    authors: (AuthorProps | string)[];
    otherTitles?: string[];
    infolinks?: MangaInfoLink;
    hotlinks?: (HotlinkProps | string)[];
    status?: ProjectStatus;
}

interface MangaLayoutProps {
    post: RawBlogContent;
}

export default function LayoutMangaIndex(props: MangaLayoutProps) {
    const {
        post: { frontMatter, mdxSource },
    } = props;

    const extraData = props.post.extraData as ExtraData;

    let firstImage: Nullable<string> = null;
    if (Array.isArray(frontMatter.images) && frontMatter.images.length > 0) {
        firstImage = frontMatter.images[0];
    }

    const synopsis = extraData?.synopsis || "*No synopsis*";
    const synopsisForDesc = extraData?.synopsis || `Manga releases of ${frontMatter.title}`;

    const { hotlinks, otherTitles, infolinks } = extraData;
    const projectStatus = extraData?.status || "ongoing";

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
                    description={synopsisForDesc}
                    htmlDescription={`Manga releases of ${frontMatter.title}`}
                    image={firstImage}
                    urlPath={`/manga/${frontMatter.slug}`}
                    siteName="nao Manga"
                    smallImage
                />
                <MetadataHead.Prefetch
                    extras={[
                        // jnc cdn
                        "https://d2dq7ifhe7bu0f.cloudfront.net",
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
                        // wp media resizer
                        "https://i1.wp.com",
                        // play books cdn
                        "https://books.google.com",
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
                            />
                        </div>
                    )}
                </div>

                {Array.isArray(otherTitles) && otherTitles.length > 0 && (
                    <div className="flex flex-col items-center md:items-start mt-4 mx-4 max-w-[65ch]">
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

                <div id="project-status" className="flex flex-col items-center md:items-start mt-4 mx-4">
                    <h3 className="mb-1 font-semibold">Status</h3>
                    <ProjectStatusRender key="project-status" status={projectStatus} />
                </div>

                <div id="synopsis" className="flex flex-col items-center md:items-start mt-4 mx-4">
                    <div
                        key="synopsis-render"
                        className="text-center md:text-left prose dark:prose-invert"
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
                            {infolinks.mangadex && (
                                <LinkIconRender
                                    key="mangadex-link"
                                    url={`https://mangadex.org/title/${infolinks.mangadex}`}
                                />
                            )}
                            {infolinks.official && (
                                <LinkIconRender key="official-link" url={infolinks.official} />
                            )}
                        </div>
                    </div>
                )}

                {Array.isArray(hotlinks) && hotlinks.length > 0 && (
                    <div id="download-links" className="flex flex-col items-center md:items-start mt-4 mx-4">
                        <h3 className="mb-2 font-semibold">{`Download${hotlinks.length > 1 ? "s" : ""}`}</h3>
                        <div className="flex flex-col gap-2">
                            {hotlinks.map((hotlink, idx) => {
                                let hotlinkId = `hotlink-${idx}`;
                                let actualUrl: string;
                                let actualTitle = undefined;
                                if (typeof hotlink === "string") {
                                    actualUrl = hotlink;
                                    hotlinkId = hotlinkId + "-" + kebabCase(hotlink.toLowerCase());
                                } else {
                                    const useThis = hotlink.title || hotlink.url;
                                    actualUrl = hotlink.url;
                                    actualTitle = hotlink.title;
                                    hotlinkId = hotlinkId + "-" + kebabCase(useThis.toLowerCase());
                                }
                                return <LinkIconRender key={hotlinkId} url={actualUrl} title={actualTitle} />;
                            })}
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
