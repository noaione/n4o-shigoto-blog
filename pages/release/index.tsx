import HeaderNav from "@/components/HeaderNav";
import MagnifyingGlassOutline from "@/components/Icons/MagnifyingGlassOutline";
import MetadataHead from "@/components/MetadataHead";
import NaoTimesEmbed from "@/components/NaoTimesEmbed";
import PaginationBar from "@/components/PaginationBar";
import { FrontMatterExtended } from "@/lib/mdx";
import { Nullable } from "@/lib/utils";
import Head from "next/head";
import Link from "next/link";
import React from "react";

export const POSTS_PER_PAGE = 8;

export async function getStaticProps() {
    const { getAllPostsFrontMatter } = await import("@/lib/mdx");
    const getPosts = await getAllPostsFrontMatter("posts");
    let posts = getPosts.splice(0, POSTS_PER_PAGE);

    // serialize date
    posts = posts.map((post: FrontMatterExtended) => {
        post.date = new Date(post.date).toString();
        return post;
    });

    const pagination = {
        currentPage: 1,
        totalPages: Math.ceil(getPosts.length / POSTS_PER_PAGE) + 1,
    };

    return { props: { posts, pagination } };
}

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

interface ShigotoIndexProps {
    posts: FrontMatterExtended[];
    pagination: PaginationProps;
}

function PostViewer(props: FrontMatterExtended) {
    let firstImage: Nullable<string> = null;
    if (Array.isArray(props.images) && props.images.length > 0) {
        firstImage = props.images[0];
    }

    // @ts-ignore
    const summary = props.excerpt || props.summary;

    return (
        <div>
            {firstImage && (
                <div className="prose">
                    <img className="max-w-full mb-2" src={firstImage} alt={props.title + " Thumbnail"} />
                </div>
            )}
            <h3 className="text-2xl font-bold leading-8 tracking-tight">
                <Link href={`/r/${props.slug}`} passHref>
                    <a className="break-words text-gray-900 dark:text-gray-100 hover:underline">
                        {props.layout.toLowerCase() === "bdmv" ? <>{`[BDMV] ${props.title}`}</> : props.title}
                    </a>
                </Link>
            </h3>
            <div className="prose text-lg mt-1 text-gray-500 max-w-none dark:text-gray-400">
                <p>{summary}</p>
            </div>
            <div className="mt-2">
                {props.tags && props.tags.length > 0 && (
                    <div className="flex flex-row gap-1">
                        {props.tags.map((tag: string) => (
                            <Link key={`tagar-${props.slug}-${tag}`} href={`/release/tags/${tag}`} passHref>
                                <a className="text-blue-500 hover:opacity-70 transition">{"#" + tag}</a>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ShigotoIndexPage({ posts, pagination }: ShigotoIndexProps) {
    return (
        <>
            <Head>
                <title>Releases :: N4O Shigoto</title>
                <MetadataHead.SEO title="Releases" description="N4O fansub works and more" smallImage />
                <MetadataHead.Prefetch />
            </Head>
            <div className="max-w-3xl px-4 mx-auto sm:px-6 xl:max-w-5xl xl:px-0">
                <div className="flex flex-col justify-between h-screen">
                    <HeaderNav />
                    <main className="mb-auto">
                        <div className="max-w-3xl px-4 mx-auto sm:px-6 xl:max-w-5xl xl:px-0">
                            <article>
                                <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
                                    <div className="pt-6 pb-8 space-y-2 md:space-y-5">
                                        <h1 className="text-4xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:leading-10 md:leading-14 ">
                                            Releases
                                        </h1>
                                        <div className="relative max-w-lg pt-2">
                                            <input
                                                type="text"
                                                className="block w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-md dark:border-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100 transition"
                                                placeholder="Search..."
                                                aria-placeholder="Search..."
                                                aria-label="Search"
                                            />
                                            <MagnifyingGlassOutline className="absolute w-5 h-5 text-gray-400 right-3 top-4 dark:text-gray-300" />
                                        </div>
                                    </div>
                                    <hr className="block xl:hidden border-gray-200 dark:border-gray-700" />
                                    <div
                                        className="pb-8 divide-y divide-gray-200 xl:divide-y-0 dark:divide-gray-700 xl:grid xl:grid-cols-3 xl:gap-x-6"
                                        style={{
                                            gridTemplateRows: "auto 1fr",
                                        }}
                                    >
                                        <div
                                            className="divide-y divide-gray-200 dark:divide-gray-700 xl:pb-0"
                                            style={{
                                                gridArea: "1 / 2 / 2 / 4",
                                            }}
                                        >
                                            <div className="pt-10 pb-8 prose dark:prose-dark max-w-none">
                                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {posts.map((post) => (
                                                        <li key={post.slug} className="py-4">
                                                            <PostViewer key={post.slug} {...post} />
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <PaginationBar {...pagination} isPosts />
                                        </div>
                                        <footer>
                                            <div
                                                className="text-sm font-medium leading-5 divide-gray-200 xl:divide-y dark:divide-gray-700"
                                                style={{
                                                    gridArea: "1 / 1 / 2 / 2",
                                                }}
                                            >
                                                <div className="py-4 xl:py-8">
                                                    <h2 className="text-sm tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                                        Project Status
                                                    </h2>
                                                    <div className="mt-2">
                                                        <NaoTimesEmbed
                                                            serverId="472705451117641729"
                                                            accentColor="blue"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </footer>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
