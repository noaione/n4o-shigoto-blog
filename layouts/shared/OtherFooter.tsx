import Link from "next/link";
import React from "react";

import { IconPerpusIndo, IconNyaa, IconBaseFavicon } from "@/components/Icons/External";
import Image from "next/image";

export default function OtherFooterRender(props: { lang?: string }) {
    const lang = props.lang || "en";
    return (
        <div id="info-other">
            <p className="my-2 text-center font-bold text-md">{lang === "id" ? "Hal Lain" : "Other Stuff"}</p>
            <div className="flex flex-row justify-center gap-1">
                <Link href="/release" className="hover:opacity-75 active:opacity-75 transition-opacity">
                    <Image src={IconBaseFavicon} alt="Home" className="rounded-md" />
                </Link>
                <Link
                    href="https://nyaa.si/user/NoAiOne"
                    className="hover:opacity-75 active:opacity-75 transition-opacity"
                >
                    <Image src={IconNyaa} alt="Nyaa: NoAiOne" className="rounded-md" />
                </Link>
                <Link
                    href="https://www.perpusindo.info/user/N4O"
                    className="hover:opacity-75 active:opacity-75 transition-opacity"
                >
                    <Image src={IconPerpusIndo} alt="PerpusIndo: N4O" className="rounded-md" />
                </Link>
            </div>
        </div>
    );
}
