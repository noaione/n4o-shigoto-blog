import DisqusThread from "@/components/DisqusThread";
import MDXRenderer from "@/components/MDXRenderer";
import MetadataHead from "@/components/MetadataHead";
import { RawBlogContent } from "@/lib/mdx";
import { isNone, Nullable } from "@/lib/utils";
import Head from "next/head";
import React from "react";
import HyperlinkListRender, { IHyperlink } from "./shared/HyperlinkList";
import OtherFooterRender from "./shared/OtherFooter";

interface IPostExtra {
    comments?: boolean;
    lang?: string;
    credit?: string;
    totalSize?: string;
    urls?: IHyperlink[];
}

const ExtraStyling = `
a {
    color: #bd2929 !important;
    text-decoration: none;
    transition: all 0.25s;
}
a:hover {
    text-decoration: underline;
    color: #9e2626 !important;
}
a:visited {
    color: #561010 !important;
}
`;

export default function LayoutReleaseBDMV(props: RawBlogContent) {
    const { mdxSource, frontMatter } = props;
    const extraData = props.extraData as IPostExtra;

    let firstImage: Nullable<string> = null;
    if (Array.isArray(frontMatter.images) && frontMatter.images.length > 0) {
        firstImage = frontMatter.images[0];
    }

    return (
        <>
            <Head>
                <title>{frontMatter.title} :: N4O Shigoto</title>
                <MetadataHead.SEO
                    title={frontMatter.title}
                    description={frontMatter.summary}
                    image={firstImage}
                    urlPath={`/r/${frontMatter.slug}`}
                />
                <MetadataHead.Prefetch />
                <style>{ExtraStyling}</style>
            </Head>
            <div id="outer-post" className="flex justify-center py-4">
                <div
                    id="inner-post"
                    className="m-auto mx-1 w-full sm:w-5/6 md:w-1/2 dark:bg-gray-700 dark:text-gray-200 p-2 overflow-x-hidden"
                    style={{
                        boxShadow: "0 0 5px 2px #777777",
                    }}
                >
                    <h1 className="mt-1 mb-2 mx-0 text-center text-2xl font-bold">{frontMatter.title}</h1>
                    {!isNone(firstImage) && (
                        <img
                            className="max-w-full max-h-full block mx-auto"
                            src={firstImage}
                            alt="Post Image"
                        />
                    )}
                    <div id="post-preface" className="mt-2">
                        <p>
                            <strong>Credit to:</strong> {extraData.credit ?? "Anonymous"}
                        </p>
                        <p>
                            <strong>Size:</strong> {extraData.totalSize ?? "???"}
                        </p>
                    </div>
                    <div id="post-content" className="mt-1 max-w-full">
                        <MDXRenderer mdxSource={mdxSource} />
                    </div>
                    <div id="post-info" className="mt-6 mb-2 text-center">
                        <HyperlinkListRender urls={extraData?.urls} lang={extraData?.lang} />
                    </div>
                    <div id="post-other" className="mb-2 text-center">
                        <OtherFooterRender lang={extraData?.lang} />
                    </div>
                    {extraData.comments && <DisqusThread identifier={frontMatter.slug} />}
                </div>
            </div>
        </>
    );
}
