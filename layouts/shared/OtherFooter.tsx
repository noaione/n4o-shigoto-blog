import Link from "next/link";
import React from "react";

import { IconPerpusIndo, IconNyaa, IconBaseFavicon } from "@/components/Icons/External";

export default function OtherFooterRender(props: { lang?: string }) {
    const lang = props.lang || "en";
    return (
        <div id="info-other">
            <p className="my-2 text-center font-bold text-md">{lang === "id" ? "Hal Lain" : "Other Stuff"}</p>
            <div className="flex flex-row justify-center gap-1">
                <Link href="/release" passHref>
                    <a className="hover:opacity-75 active:opacity-75 transition-opacity">
                        <img src={IconBaseFavicon.src} width={32} className="rounded-md" />
                    </a>
                </Link>
                <Link href="https://nyaa.si/user/NoAiOne" passHref>
                    <a className="hover:opacity-75 active:opacity-75 transition-opacity">
                        <img src={IconNyaa.src} width={32} className="rounded-md" />
                    </a>
                </Link>
                <Link href="https://www.perpusindo.info/user/N4O" passHref>
                    <a className="hover:opacity-75 active:opacity-75 transition-opacity">
                        <img src={IconPerpusIndo.src} width={32} className="rounded-md" />
                    </a>
                </Link>
            </div>
        </div>
    );
}
