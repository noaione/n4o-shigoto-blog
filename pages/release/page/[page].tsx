import MetadataHead from "@/components/MetadataHead";
import ListReleaseLayout from "@/layouts/ListRelease";
import { FrontMatterExtended } from "@/lib/mdx";
import { GetStaticPropsContext } from "next";
import Head from "next/head";
import React from "react";

import { POSTS_PER_PAGE } from "..";

export async function getStaticPaths() {
    const { getAllPosts } = await import("@/lib/mdx");
    const totalPosts = await getAllPosts("posts");

    const totalPages = Math.ceil(totalPosts.length / POSTS_PER_PAGE);
    const paths = Array.from({ length: totalPages }, (_, i) => ({
        params: {
            page: "" + (i + 1),
        },
    }));

    return {
        paths,
        fallback: false,
    };
}

function selectFirst(thing: string | string[]): string {
    if (Array.isArray(thing)) {
        return thing[0];
    }
    return thing;
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
    const { getAllPostsFrontMatter } = await import("@/lib/mdx");
    const getPosts = await getAllPostsFrontMatter("posts");
    const pageRaw = params && params.page ? selectFirst(params.page) : "1";
    const pageNumber = parseInt(pageRaw);
    let postsPerPage = getPosts.slice(POSTS_PER_PAGE * (pageNumber - 1), POSTS_PER_PAGE * pageNumber);

    // serialize date
    postsPerPage = postsPerPage.map((post: FrontMatterExtended) => {
        post.date = new Date(post.date).toString();
        return post;
    });

    const pagination = {
        currentPage: pageNumber,
        totalPages: Math.ceil(getPosts.length / POSTS_PER_PAGE),
    };

    return { props: { postsPerPage, pagination } };
}

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

interface ShigotoIndexProps {
    postsPerPage: FrontMatterExtended[];
    pagination: PaginationProps;
}

export default function ShigotoIndexPaginated({ postsPerPage, pagination }: ShigotoIndexProps) {
    const pageTitle = `Releases ${pagination.currentPage}/${pagination.totalPages}`;
    return (
        <>
            <Head>
                <title>{`${pageTitle} :: N4O Shigoto`}</title>
                <MetadataHead.SEO title={pageTitle} description="N4O fansub works and more" smallImage />
                <MetadataHead.Prefetch />
            </Head>
            <ListReleaseLayout posts={postsPerPage} pagination={pagination} />
        </>
    );
}
