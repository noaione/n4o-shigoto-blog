import React from "react";
import Image from "next/image";
import Favicon from "../public/assets/ico/favicon.png";
import Link from "next/link";
import Head from "next/head";
import MetadataHead from "@/components/MetadataHead";

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
                        />
                    </div>
                    <div className="flex flex-col mt-5 text-center">
                        <h1 className="text-2xl font-bold">N4O Release</h1>
                        <h2 className="text-xl font-semibold mt-1">Blog Directory</h2>
                    </div>
                    <div className="flex flex-col mt-4 justify-center items-center space-y-2">
                        <div className="flex flex-row items-center space-x-2">
                            <Link href="https://n4o.xyz" passHref>
                                <a className="bg-none border-2 border-blue-400 rounded-md p-4 hover:bg-blue-500 hover:bg-opacity-50 hover:border-white transition">
                                    Home
                                </a>
                            </Link>
                            <Link href="https://blog.n4o.xyz" passHref>
                                <a className="bg-none border-2 border-purple-400 rounded-md p-4 hover:bg-purple-500 hover:bg-opacity-50 hover:border-white transition">
                                    Blog
                                </a>
                            </Link>
                        </div>
                        <div className="flex flex-row items-center space-x-2">
                            <Link href="/release" passHref>
                                <a className="bg-none border-2 border-orange-400 rounded-md p-4 hover:bg-orange-500 hover:bg-opacity-50 hover:border-white transition">
                                    Release
                                </a>
                            </Link>
                            <Link href="/manga" passHref>
                                <a className="bg-none border-2 border-emerald-400 rounded-md p-4 hover:bg-emerald-500 hover:bg-opacity-50 hover:border-white transition">
                                    Manga
                                </a>
                            </Link>
                        </div>
                        <div className="flex flex-row items-center space-x-1 pt-3">
                            <Link href="/holoism" passHref>
                                <a className="opacity-100 hover:opacity-80 duration-200">
                                    <img
                                        width={50}
                                        height={50}
                                        alt="Ahoy!"
                                        src="https://cdn.discordapp.com/emojis/643678659298983957.png"
                                    />
                                </a>
                            </Link>
                            <Link href="/holo9weeks" passHref>
                                <a className="opacity-100 hover:opacity-80 duration-200">
                                    <img
                                        width={50}
                                        height={50}
                                        alt="Hololive"
                                        src="https://cdn.discordapp.com/emojis/663796277137506333.png"
                                    />
                                </a>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
