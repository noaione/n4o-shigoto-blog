import DisqusThread from "@/components/DisqusThread";
import MDXRenderer from "@/components/MDXRenderer";
import MetadataHead from "@/components/MetadataHead";
import { RawBlogContent } from "@/lib/mdx";
import { isNone, Nullable } from "@/lib/utils";
import Head from "next/head";
import React from "react";
import sanitizeHtml from "sanitize-html";
import HyperlinkListRender, { IHyperlink } from "./HyperlinkList";
import OtherFooterRender from "./OtherFooter";
import Image from "next/image";

interface IStaffList {
    position: string;
    name: string;
    link?: string;
}

interface IPostExtra {
    comments?: boolean;
    lang?: string;
    urls?: IHyperlink[];
    // START: BDMV Specific
    credit?: string;
    totalSize?: string;
    // END: BDMV Specific
    // START: Post Specific
    staffLists?: IStaffList[];
    // END: Post Specific
}

function StaffRender(props: IStaffList) {
    return (
        <p className="my-[0.20rem] text-center text-base">
            <strong>{props.position}:</strong>
            {isNone(props.link) ? (
                <span className="ml-1" dangerouslySetInnerHTML={{ __html: sanitizeHtml(props.name) }}></span>
            ) : (
                <a href={props.link}> {props.name}</a>
            )}
        </p>
    );
}

function StaffListRender(props: { staffs?: IStaffList[]; lang?: string }) {
    const { staffs } = props;
    if (isNone(staffs)) {
        return null;
    }
    if (!Array.isArray(staffs)) {
        return null;
    }
    if (staffs.length < 1) {
        return null;
    }
    const lang = props.lang || "en";

    return (
        <div id="info-staff-content">
            <p className="my-2 text-center font-bold text-md">{lang === "id" ? "Tukang Kerja" : "Credits"}</p>
            {staffs.map((staff) => {
                return <StaffRender key={`${staff.position}_${staff.name}`} {...staff} />;
            })}
        </div>
    );
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
a:visited:hover {
    color: #9e2626 !important;
}
`;

interface ILayoutReleaseProps extends RawBlogContent {
    isBDMVFormat?: boolean;
}

export default function LayoutReleaseBasePost(props: ILayoutReleaseProps) {
    const { mdxSource, frontMatter, isBDMVFormat } = props;
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
                    <h1 className="mt-1 mb-4 mx-0 text-center text-2xl font-bold">{frontMatter.title}</h1>
                    {!isNone(firstImage) && (
                        <Image
                            className="max-w-full max-h-full block mx-auto"
                            src={firstImage}
                            alt="Post Image"
                            width={1920}
                            height={1080}
                        />
                    )}
                    {isBDMVFormat && (
                        <div id="post-preface" className="mt-2">
                            <p>
                                <strong>Credit to:</strong> {extraData.credit ?? "Anonymous"}
                            </p>
                            <p>
                                <strong>Size:</strong> {extraData.totalSize ?? "???"}
                            </p>
                        </div>
                    )}
                    <div
                        id="post-content"
                        className="mt-2 prose dark:prose-invert prose-p:my-3 prose-li:m-0 text-gray-600 dark:text-gray-100 max-w-full"
                    >
                        <MDXRenderer mdxSource={mdxSource} />
                    </div>
                    <div id="post-info" className="mt-6 mb-2 text-center">
                        {!isBDMVFormat && Array.isArray(extraData?.staffLists) && (
                            <StaffListRender staffs={extraData?.staffLists} lang={extraData?.lang} />
                        )}
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
