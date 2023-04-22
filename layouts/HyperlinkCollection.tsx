import MetadataHead from "@/components/MetadataHead";
import { isNone } from "@/lib/utils";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

interface ILink {
    name?: string;
    notes?: string;
    url: string;
}

export interface ILayoutHyperlinkProps {
    slug: string;
    title: string;
    summary?: string;
    thumbnail?: string;
    links?: ILink[] | string[];
    groupedLinks?: {
        [groupName: string]: ILink[] | string[];
    };
}

function makeAsILink(links: ILink[] | string[]): ILink[] {
    const convertedLinks = [];
    for (const link of links) {
        if (typeof link === "string") {
            convertedLinks.push({
                url: link,
            });
        } else {
            convertedLinks.push(link);
        }
    }
    return convertedLinks;
}

function HyperlinkContainer(props: { links: ILink[] | string[]; groupName?: string }) {
    const { links, groupName } = props;

    const convertedLinks = makeAsILink(links);
    const linksWithNotes = convertedLinks.filter((link) => link.notes);
    return (
        <div className="flex flex-col justify-center my-4">
            {groupName && <h3 className="text-lg font-bold text-center mb-2">{groupName}</h3>}

            <div className="flex flex-row flex-wrap justify-center">
                {convertedLinks.map((link) => {
                    return (
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={link.url}
                            className="px-[1rem] py-[0.8rem] mx-2 my-1 rounded-md font-semibold bg-teal-700 hover:opacity-75 transition-opacity text-white"
                        >
                            {link.name || link.url}
                        </a>
                    );
                })}
            </div>
            {linksWithNotes && (
                <div className="flex flex-col flex-wrap justify-center items-center mt-1">
                    {linksWithNotes.map((link) => {
                        return (
                            <p key={link.url + "-notesdata"}>
                                <span className="font-bold">{link.name}</span> - {link.notes}
                            </p>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function LayoutHyperlinkCollection(props: ILayoutHyperlinkProps) {
    const { title, summary, thumbnail, links, groupedLinks, slug } = props;

    return (
        <>
            <Head>
                <title>{title + " :: Hyperlinks :: N4O Shigoto"}</title>
                <MetadataHead.SEO
                    title={title + " - Hyperlinks"}
                    description={summary || `Hyperlink collection for ${title}`}
                    image={thumbnail}
                    urlPath={`/r/${slug}/hyperlinks`}
                />
                <MetadataHead.Prefetch />
            </Head>
            <div className="flex justify-center py-4">
                <div className="m-auto mx-1 w-full sm:w-5/6 md:w-1/2 dark:bg-gray-800 dark:text-gray-200 p-2 overflow-x-hidden">
                    <h1 className="mt-1 mb-4 mx-0 text-center text-2xl font-bold">{title}</h1>
                    {!isNone(thumbnail) && (
                        <Image
                            className="max-w-full max-h-full block mx-auto"
                            src={thumbnail}
                            alt="Post Image"
                            width={1920}
                            height={1080}
                        />
                    )}
                    <hr />
                    <div className="flex flex-row justify-center mt-4">
                        <Link
                            href={`/r/${slug}`}
                            className="px-2 py-1 bg-red-700 rounded font-light uppercase tracking-wider text-white transition-opacity hover:opacity-75"
                        >
                            Post
                        </Link>
                    </div>
                    {groupedLinks &&
                        Object.keys(groupedLinks).map((groupName) => {
                            return (
                                <HyperlinkContainer
                                    key={groupName}
                                    links={groupedLinks[groupName]}
                                    groupName={groupName}
                                />
                            );
                        })}
                    {links && <HyperlinkContainer key="default-group" links={links} />}
                </div>
            </div>
        </>
    );
}
