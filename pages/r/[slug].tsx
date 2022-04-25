import type { FrontMatterData, RawBlogContent } from "@/lib/mdx";
import LayoutReleasePost from "@/layouts/ReleasePost";

import { useEffect, useState } from "react";
// import { useRouter } from 'next/router'
import { GetStaticPropsContext } from "next";

export async function getStaticPaths() {
    const { getAllPosts, formatSlug } = await import("@/lib/mdx");
    const posts = await getAllPosts("posts");
    const allPaths = posts.map((p) => ({
        params: {
            slug: formatSlug(p.slug as string),
        },
    }));

    return {
        paths: allPaths,
        fallback: false,
    };
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
    const { getFileBySlug, getAllPostsFrontMatter } = await import("@/lib/mdx");
    const allPosts = await getAllPostsFrontMatter("posts");
    const postIndex = allPosts.findIndex((post) => post.slug === params?.slug);
    if (postIndex < 0) {
        return {
            notFound: true,
        };
    }
    const post = await getFileBySlug(allPosts[postIndex]);

    return { props: { post } };
}

interface BlogsPosts {
    post: RawBlogContent;
}

const LayoutLoader = {
    post: LayoutReleasePost,
};

// get all keys typing
type LayoutKeys = keyof typeof LayoutLoader;

export default function ShigotoPost(props: BlogsPosts) {
    const {
        post: {
            frontMatter: { layout },
        },
    } = props;
    const LayoutRender = LayoutLoader[layout as LayoutKeys] || LayoutReleasePost;

    return <LayoutRender {...props.post} />;
}
