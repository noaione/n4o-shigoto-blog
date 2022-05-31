import MetadataHead from "@/components/MetadataHead";
import ListReleaseLayout from "@/layouts/ListRelease";
import { FrontMatterExtended } from "@/lib/mdx";
import Head from "next/head";
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

export default function ShigotoIndexPage({ posts, pagination }: ShigotoIndexProps) {
    return (
        <>
            <Head>
                <title>Releases :: N4O Shigoto</title>
                <MetadataHead.SEO title="Releases" description="N4O fansub works and more" smallImage />
                <MetadataHead.Prefetch />
            </Head>
            <ListReleaseLayout posts={posts} pagination={pagination} />
        </>
    );
}
