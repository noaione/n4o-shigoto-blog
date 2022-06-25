import type { RawBlogContent } from "@/lib/mdx";

// import { useRouter } from 'next/router'
import { GetStaticPropsContext } from "next";
import LayoutMangaIndex from "@/layouts/MangaIndex";

export async function getStaticPaths() {
    const { getAllPosts, formatSlug } = await import("@/lib/mdx");
    const posts = await getAllPosts("manga");
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
    const allPosts = await getAllPostsFrontMatter("manga", "title", "asc");
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

export default function ShigotoMangaIndexPost(props: BlogsPosts) {
    return <LayoutMangaIndex post={props.post} />;
}
