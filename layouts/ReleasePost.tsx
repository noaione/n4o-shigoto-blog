import MDXRenderer from "@/components/MDXRenderer";
import MetadataHead from "@/components/MetadataHead";
import { RawBlogContent } from "@/lib/mdx";
import { isNone, Nullable } from "@/lib/utils";
import Head from "next/head";
import React from "react";

interface IStaffList {
    position: string;
    name: string;
    link?: string;
}

interface IHyperlink {
    link?: string;
    status?: string;
    text: string;
}

interface IPostExtra {
    comments?: boolean;
    lang?: string;
    staffLists?: IStaffList[];
    urls?: IHyperlink[];
}

function StaffRender(props: IStaffList) {
    return (
        <p className="my-[0.20rem] text-center text-base">
            <strong>{props.position}:</strong>
            {isNone(props.link) ? ` ${props.name}` : <a href={props.link}> {props.name}</a>}
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
    const lang = props.lang || "id";

    return (
        <div id="info-staff-content">
            <p className="my-2 text-center font-bold text-md">{lang === "id" ? "Tukang Kerja" : "Credits"}</p>
            {staffs.map((staff) => {
                return <StaffRender key={`${staff.position}_${staff.name}`} {...staff} />;
            })}
        </div>
    );
}

function HyperlinkRender({ link, text, status }: IHyperlink) {
    if (typeof link !== "string") {
        return (
            <button
                className="bg-rose-900 text-gray-200 cursor-not-allowed rounded-md p-3 text-center font-bold text-sm my-1 mx-0.5 inline-block"
                title={status}
            >
                {text}
            </button>
        );
    }

    return (
        <a
            href={link}
            className="bg-slate-500 visited:bg-slate-600 !text-white hover:!text-white rounded-md p-3 text-center font-bold text-sm my-1 mx-0.5 inline-block hover:rounded-xl no-underline hover:no-underline transition-all"
        >
            {text}
        </a>
    );
}

function HyperlinkListRender(props: { urls?: IHyperlink[]; lang?: string }) {
    const { urls } = props;
    if (isNone(urls)) {
        return null;
    }
    if (!Array.isArray(urls)) {
        return null;
    }
    if (urls.length < 1) {
        return null;
    }
    const lang = props.lang || "id";

    return (
        <div id="info-download-content">
            <p className="my-2 text-center font-bold text-md">{lang === "id" ? "Unduh" : "Download"}</p>
            {urls.map((url, idx) => {
                return <HyperlinkRender key={`hyperlink-${idx}_${url.text}`} {...url} />;
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
`;

export default function LayoutReleasePost(props: RawBlogContent) {
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
                    <div id="post-content" className="mt-2">
                        <MDXRenderer mdxSource={mdxSource} />
                    </div>
                    <div id="post-info" className="mt-6 mb-2 text-center">
                        <StaffListRender staffs={extraData?.staffLists} lang={extraData?.lang} />
                        <HyperlinkListRender urls={extraData?.urls} lang={extraData?.lang} />
                    </div>
                </div>
            </div>
        </>
    );
}