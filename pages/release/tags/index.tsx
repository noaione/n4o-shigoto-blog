import { kebabCase } from "@/lib/utils";
import { TagCount } from "@/lib/tags";
import CustomLink from "@/components/MDX/CustomLink";
import Link from "next/link";

import Head from "next/head";
import MetadataHead from "@/components/MetadataHead";
import HeaderNav from "@/components/HeaderNav";

type TagDatas = { [key: string]: TagCount };

export async function getStaticProps() {
    const { getAllTags } = await import("@/lib/tags");
    const tags = await getAllTags("posts");

    return { props: { tags } };
}

const Tag = ({ text }: { text: string }) => {
    return (
        <Link
            href={`/release/tags/${kebabCase(text)}`}
            className="mr-3 text-sm font-medium text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
        >
            {"#" + text}
        </Link>
    );
};

export default function Tags({ tags }: { tags: TagDatas }) {
    const sortedTags = Object.keys(tags).sort((a, b) => tags[b].count - tags[a].count);

    return (
        <>
            <Head>
                <title>Tags :: N4O Shigoto</title>
                <MetadataHead.SEO title="Tags" description="Collection of #tags used in all of our posts" />
                <MetadataHead.Prefetch />
            </Head>
            <div className="max-w-3xl px-4 mx-auto sm:px-6 xl:max-w-5xl xl:px-0">
                <div className="flex flex-col justify-between">
                    <HeaderNav isTags />
                </div>
                <div className="flex flex-colitems-start justify-start divide-y divide-gray-200 dark:divide-gray-700 md:justify-center md:items-center md:divide-y-0 md:flex-row md:space-x-6 md:mt-24">
                    <div className="pt-6 pb-8 space-x-2 md:space-y-5">
                        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 md:border-r-2 md:px-6">
                            Tags
                        </h1>
                    </div>
                    <div className="flex flex-wrap max-w-lg">
                        {Object.keys(tags).length === 0 && "No tags available."}
                        {sortedTags.map((t) => {
                            return (
                                <div key={t} className="mt-2 mb-2 mr-5">
                                    <Tag text={t} />
                                    <CustomLink
                                        href={`/release/tags/${kebabCase(t)}`}
                                        className="-ml-2 text-sm font-semibold text-gray-600 uppercase dark:text-gray-300"
                                    >
                                        {` (${tags[t]["count"]})`}
                                    </CustomLink>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
