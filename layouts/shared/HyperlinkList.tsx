import React from "react";
import { isNone } from "@/lib/utils";

export interface IHyperlink {
    link?: string;
    status?: string;
    text: string;
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

export default function HyperlinkListRender(props: { urls?: IHyperlink[]; lang?: string }) {
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
