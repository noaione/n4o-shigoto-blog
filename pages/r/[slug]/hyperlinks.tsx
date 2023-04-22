import type { RawBlogContent } from "@/lib/mdx";

import { GetStaticPropsContext } from "next";
import LayoutHyperlinkCollection, { ILayoutHyperlinkProps } from "@/layouts/HyperlinkCollection";

export async function getStaticPaths() {
    const { getAllPosts, formatSlug } = await import("@/lib/mdx");
    const posts = await getAllPosts("hyperlinks");
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
    const allPosts = await getAllPostsFrontMatter("hyperlinks");
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

export default function ShigotoPostHyperlinkBatch(props: BlogsPosts) {
    const {
        post: { frontMatter, extraData },
    } = props;

    const frontMatterCoerce = {
        slug: frontMatter.slug,
        title: frontMatter.title,
        summary: frontMatter.summary,
        thumbnail: extraData.thumbnail,
        links: extraData.links,
        groupedLinks: extraData.groupedLinks,
    } as ILayoutHyperlinkProps;

    return <LayoutHyperlinkCollection {...frontMatterCoerce} />;
}
