import MetadataHead from "@/components/MetadataHead";
import ListReleaseLayout from "@/layouts/ListRelease";
import { FrontMatterExtended } from "@/lib/mdx";
import { isNone, kebabCase } from "@/lib/utils";
import { GetStaticPropsContext } from "next";
import Head from "next/head";
import React from "react";

export const POSTS_PER_PAGE = 8;

export async function getStaticPaths() {
    const { getAllTags } = await import("@/lib/tags");
    const tags = await getAllTags("posts");

    const paths = Object.keys(tags).map((tag) => ({
        params: {
            tag: kebabCase(tag),
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
    const tagData = params && params.tag ? selectFirst(params.tag) : null;
    if (isNone(tagData)) {
        return {
            notFound: true,
        };
    }
    const postWithTags = getPosts.filter((post: FrontMatterExtended) => {
        const { tags } = post;
        if (Array.isArray(tags)) {
            return tags.map((e) => kebabCase(e)).includes(tagData);
        }
        return false;
    });
    if (postWithTags.length < 1) {
        return {
            notFound: true,
        };
    }
    const postCount = postWithTags.length;
    let posts = postWithTags.splice(0, POSTS_PER_PAGE);

    // serialize date
    posts = posts.map((post: FrontMatterExtended) => {
        post.date = new Date(post.date).toString();
        return post;
    });

    const pagination = {
        currentPage: 1,
        totalPages: Math.ceil(postWithTags.length / POSTS_PER_PAGE) + 1,
    };

    return { props: { posts, pagination, tagName: tagData, tagCount: postCount } };
}

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

interface ShigotoTagsIndexProps {
    posts: FrontMatterExtended[];
    pagination: PaginationProps;
    tagName: string;
    tagCount: number;
}

export default function ShigotoTagsIndexPage({
    posts,
    pagination,
    tagName,
    tagCount,
}: ShigotoTagsIndexProps) {
    return (
        <>
            <Head>
                <title>Tags - #{tagName} :: N4O Shigoto</title>
                <MetadataHead.SEO
                    title={`Tags - #${tagName}`}
                    description={`${tagCount} posts with tag #${tagName}`}
                    smallImage
                />
                <MetadataHead.Prefetch />
            </Head>
            <ListReleaseLayout
                posts={posts}
                pagination={pagination}
                pageTitle={`#${tagName} (${tagCount})`}
                isTags
            />
        </>
    );
}
