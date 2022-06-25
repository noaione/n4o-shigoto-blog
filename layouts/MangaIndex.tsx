import MetadataHead from "@/components/MetadataHead";
import type { RawBlogContent } from "@/lib/mdx";
import { kebabCase, Nullable } from "@/lib/utils";
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

interface ExtraData {
    synopsis?: string;
    authors: (AuthorProps | string)[];
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

    return (
        <>
            <Head>
                <title>{frontMatter.title} :: Manga Index - Shigoto</title>
                <MetadataHead.SEO
                    title={frontMatter.title}
                    description={frontMatter.title}
                    image={firstImage}
                    urlPath={`/manga/${frontMatter.slug}`}
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
                <div className="flex flex-row mt-4 mx-4 justify-center md:justify-start">
                    {firstImage && (
                        <div className="xs:w-64 md:w-72 lg:w-96">
                            <img className="w-full rounded-md" alt="Cover" src={firstImage} />
                        </div>
                    )}
                </div>
                <div className="flex flex-row flex-wrap gap-3 md:gap-4 justify-center md:justify-start mt-4 mx-4 max-w-[65ch]">
                    {extraData.authors.map((author, idx) => {
                        let authorId = `author-${idx}`;
                        if (typeof author === "string") {
                            authorId = author + "-" + kebabCase(author.toLowerCase());
                        } else {
                            authorId = author + "-" + kebabCase(author.role.toLowerCase());
                        }
                        return <AuthorRender key={authorId} author={author} />;
                    })}
                </div>

                <div className="flex flex-col items-center md:items-start mt-4 mx-4">
                    <div
                        className="text-center md:text-left prose dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(synopsis) }}
                    />
                </div>
            </main>
        </>
    );
}
