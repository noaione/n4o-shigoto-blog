import type { RawBlogContent } from "@/lib/mdx";

// import { useRouter } from 'next/router'
import { GetStaticPropsContext } from "next";
import LayoutHoloism from "@/layouts/Holoism";

export async function getStaticPaths() {
    const { getAllPosts, formatSlug } = await import("@/lib/mdx");
    const posts = await getAllPosts("holoism");
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
    const allPosts = await getAllPostsFrontMatter("holoism");
    const postIndex = allPosts.findIndex((post) => post.slug === params?.slug);
    if (postIndex < 0) {
        return {
            notFound: true,
        };
    }
    const post = await getFileBySlug(allPosts[postIndex]);
    const hasPrev = postIndex > 0;
    const hasNext = postIndex < allPosts.length - 1;

    return { props: { post, hasPrev, hasNext } };
}

interface BlogsPosts {
    post: RawBlogContent;
    hasPrev: boolean;
    hasNext: boolean;
}

export default function ShigotoHoloismPost(props: BlogsPosts) {
    return <LayoutHoloism {...props} />;
}
