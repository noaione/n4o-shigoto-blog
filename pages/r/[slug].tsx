import type { RawBlogContent } from "@/lib/mdx";
import getLayout, { Layouts } from "@/layouts/index";

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

export default function ShigotoPost(props: BlogsPosts) {
    const {
        post: {
            frontMatter: { layout },
        },
    } = props;
    const LayoutRender = getLayout(layout as Layouts);

    // @ts-ignore
    return <LayoutRender {...props.post} />;
}
