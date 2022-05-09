import React from "react";

import type { FrontMatterExtended } from "@/lib/mdx";
import Link from "next/link";
import Head from "next/head";
import MetadataHead from "@/components/MetadataHead";
import Slider from "react-slick";

export async function getStaticProps() {
    const { getAllPostsFrontMatter } = await import("@/lib/mdx");
    const posts = await getAllPostsFrontMatter("holo9w");

    return { props: { posts, disableDarkToggle: true } };
}

interface FrontMatterHolo9Weeks extends FrontMatterExtended {
    trackNumber?: number;
    thumbfile: string;
    title: string;
    info: {
        title: string;
        othertitle?: string;
        singer?: string;
    };
}

interface StaticPropsData {
    posts: FrontMatterHolo9Weeks[];
}

interface ImageCarouselProps {
    posts: FrontMatterHolo9Weeks[];
    onChange: (post: FrontMatterHolo9Weeks) => void;
}

class ImageCarousel extends React.Component<ImageCarouselProps> {
    constructor(props: ImageCarouselProps) {
        super(props);
    }

    render() {
        return (
            <Slider
                dots
                infinite
                speed={500}
                slidesToShow={1}
                slidesToScroll={1}
                autoplay={true}
                afterChange={(num) => this.props.onChange(this.props.posts[num])}
            >
                {this.props.posts.map((e) => {
                    return (
                        <div
                            key={`song-${e.thumbfile}_${e.trackNumber}`}
                            className="relative float-left w-full"
                        >
                            <Link href={`/holo9weeks/${e.slug}`} passHref>
                                <a className="relative">
                                    <img
                                        className="w-full h-full block"
                                        src={`/assets/img/holo9w/${e.thumbfile}.jpg`}
                                        alt={e.title}
                                    />
                                </a>
                            </Link>
                        </div>
                    );
                })}
            </Slider>
        );
    }
}

export default function Holo9WeeksIndexPage({ posts }: StaticPropsData) {
    const allTracks = posts.sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0));
    const [currentTrack, setCurrentTrack] = React.useState(allTracks[0]);

    const makeTitle = (data: FrontMatterHolo9Weeks) => {
        const {
            info: { title, othertitle },
        } = data;

        if (othertitle) {
            return `${title} / ${othertitle}`;
        }
        return title;
    };

    const makeSinger = (data: FrontMatterHolo9Weeks) => {
        const {
            info: { singer },
        } = data;

        if (singer) {
            return singer.replaceAll(", ", " / ");
        }
        return "hololive IDOL Project";
    };

    return (
        <>
            <Head>
                <link
                    rel="stylesheet"
                    type="text/css"
                    href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
                />
                <link
                    rel="stylesheet"
                    type="text/css"
                    href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
                />
            </Head>
            <main className="py-8">
                <div className="text-center mb-4">
                    <h2 className="text-xl font-bold">
                        hololive IDOL PROJECT 9 weeks of consecutive original songs
                    </h2>
                    <h4 className="mb-4 text-lg font-normal">9 weeks of original songs</h4>
                    <Link href="/" passHref>
                        <a className="mx-auto px-4 text-lg font-medium hover:text-blue-500 transition">
                            🏠 Home
                        </a>
                    </Link>
                    <br />
                    <h4 className="font-light text-lg">Click the Image for more Info</h4>
                </div>
                <div className="relative mx-auto w-[90%] md:w-[50%] text-center px-4 justify-center">
                    <ImageCarousel posts={allTracks} onChange={(post) => setCurrentTrack(post)} />
                </div>
                <div className="relative mx-auto py-4 mt-8 w-[70%] md:w-[40%] text-center px-4 justify-center bg-black bg-opacity-50">
                    <span className="font-mono font-normal">
                        {currentTrack.trackNumber ? `#${currentTrack.trackNumber}` : "Album"}
                    </span>
                    <h5 className="font-medium text-[1.25rem]">{makeTitle(currentTrack)}</h5>
                    <p>{makeSinger(currentTrack)}</p>
                </div>
            </main>
        </>
    );
}
