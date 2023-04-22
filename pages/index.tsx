import React from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import MetadataHead from "@/components/MetadataHead";

import Favicon from "#/ico/favicon.png";
import MarineAhoy from "#/img/MarineAhoy.png";
import MarineAhoyPause from "#/img/MarineAhoyPause.png";
import HoloIcon from "#/img/holo9w/holoIcon.png";

function makeSrcSet(sourceTarget: string, sourceUrl: string, targetUrl: string) {
    const encodedS = encodeURIComponent(sourceUrl);
    const encodedT = encodeURIComponent(targetUrl);

    return sourceTarget.replaceAll(encodedS, encodedT);
}

export default function Home() {
    return (
        <>
            <Head>
                <title>Home :: N4O Shigoto</title>
                <MetadataHead.SEO title="Home" />
                <MetadataHead.Prefetch />
            </Head>
            <main className="py-8">
                <div className="flex flex-col items-center">
                    <div className="flex items-center select-none">
                        <Image
                            className="object-fill object-center rounded-full"
                            width={250}
                            height={250}
                            src={Favicon}
                            alt="N4O Shigoto"
                        />
                    </div>
                    <div className="flex flex-col mt-5 text-center">
                        <h1 className="text-2xl font-bold">N4O Release</h1>
                        <h2 className="text-xl font-semibold mt-1">Blog Directory</h2>
                    </div>
                    <div className="flex flex-col mt-4 justify-center items-center space-y-2">
                        <div className="flex flex-row items-center space-x-2">
                            <Link
                                href="https://n4o.xyz"
                                className="bg-none border-2 border-blue-400 rounded-md p-4 hover:bg-blue-500 hover:bg-opacity-50 hover:border-white transition"
                            >
                                Home
                            </Link>
                            <Link
                                href="https://blog.n4o.xyz"
                                className="bg-none border-2 border-purple-400 rounded-md p-4 hover:bg-purple-500 hover:bg-opacity-50 hover:border-white transition"
                            >
                                Blog
                            </Link>
                        </div>
                        <div className="flex flex-row items-center space-x-2">
                            <Link
                                href="/release"
                                className="bg-none border-2 border-orange-400 rounded-md p-4 hover:bg-orange-500 hover:bg-opacity-50 hover:border-white transition"
                            >
                                Release
                            </Link>
                            <Link
                                href="/manga"
                                className="bg-none border-2 border-emerald-400 rounded-md p-4 hover:bg-emerald-500 hover:bg-opacity-50 hover:border-white transition"
                            >
                                Manga
                            </Link>
                        </div>
                        <div className="flex flex-row items-center space-x-1 pt-3">
                            <Link href="/holoism" className="opacity-100 hover:opacity-80 duration-200">
                                <Image
                                    width={50}
                                    height={50}
                                    alt="Ahoy!"
                                    src={MarineAhoy}
                                    onMouseEnter={(el) => {
                                        el.currentTarget.src = MarineAhoyPause.src;
                                        el.currentTarget.alt = "Ahoy...?";
                                        const srcSet = makeSrcSet(
                                            el.currentTarget.srcset,
                                            MarineAhoy.src,
                                            MarineAhoyPause.src
                                        );
                                        el.currentTarget.srcset = srcSet;
                                    }}
                                    onMouseLeave={(el) => {
                                        el.currentTarget.src = MarineAhoy.src;
                                        el.currentTarget.alt = "Ahoy!";
                                        const srcSet = makeSrcSet(
                                            el.currentTarget.srcset,
                                            MarineAhoyPause.src,
                                            MarineAhoy.src
                                        );
                                        el.currentTarget.srcset = srcSet;
                                    }}
                                    onTouchStart={(el) => {
                                        el.currentTarget.src = MarineAhoyPause.src;
                                        el.currentTarget.alt = "Ahoy...?";
                                        const srcSet = makeSrcSet(
                                            el.currentTarget.srcset,
                                            MarineAhoy.src,
                                            MarineAhoyPause.src
                                        );
                                        el.currentTarget.srcset = srcSet;
                                    }}
                                    onTouchEnd={(el) => {
                                        el.currentTarget.src = MarineAhoy.src;
                                        el.currentTarget.alt = "Ahoy!";
                                        const srcSet = makeSrcSet(
                                            el.currentTarget.srcset,
                                            MarineAhoyPause.src,
                                            MarineAhoy.src
                                        );
                                        el.currentTarget.srcset = srcSet;
                                    }}
                                />
                            </Link>
                            <Link
                                href="/holo9weeks"
                                className="opacity-100 hover:opacity-80 hover:rotate-[360deg] duration-200"
                            >
                                <Image alt="Hololive" src={HoloIcon} width={50} height={50} />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
