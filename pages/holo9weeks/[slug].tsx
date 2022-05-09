import type { RawBlogContent } from "@/lib/mdx";
import LayoutHolo9Weeks from "@/layouts/Holo9Song";

// import { useRouter } from 'next/router'
import { GetStaticPropsContext } from "next";

export async function getStaticPaths() {
    const { getAllPosts, formatSlug } = await import("@/lib/mdx");
    const posts = await getAllPosts("holo9w");
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
    const allPosts = await getAllPostsFrontMatter("holo9w");
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

export default function ShigotoPost(props: BlogsPosts) {
    return <LayoutHolo9Weeks {...props} />;
}
