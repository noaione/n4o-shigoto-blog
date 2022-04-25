import fs from "fs";
import path from "path";

import { bundleMDX } from "mdx-bundler";
import glob from "tiny-glob/sync";
import matter from "gray-matter";
import { Nullable } from "./utils";

const root = process.cwd();

function findFirstLine(textData: string): string {
    for (let i = 0; i < textData.length; i++) {
        const clean = textData[i].replace(/\r/, "");
        if (clean.replace(/\s/, "").length > 0) {
            return clean;
        }
    }
    return "";
}

function formatSeparators(textData: string, separators?: Nullable<string>) {
    if (typeof separators !== "string") {
        return findFirstLine(textData);
    }
    const joinedText = [];
    for (let i = 0; i < textData.length; i++) {
        const clean = textData[i].replace(/\r/, "");
        if (clean === separators) {
            break;
        }
        joinedText.push(clean);
    }
    // Bruh
    if (joinedText.length === textData.length) {
        return findFirstLine(textData);
    }
    return joinedText.join("\n");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function excerptFormatter(file: any, options: any) {
    file.excerpt = formatSeparators(file.content.split("\n"), options.excerpt_separator);
}

function formatDateToYMD(dateData: Date) {
    const month = dateData.getUTCMonth().toString().padStart(2, "0");
    const days = dateData.getUTCDay().toString().padStart(2, "0");
    return `${dateData.getUTCFullYear()}-${month}-${days}`;
}

function parseSlug(slugName: string) {
    // eslint-disable-next-line no-useless-escape
    const re = /([0-9]{4}\-[0-9]{1,2}\-[0-9]{1,2})?\-?(.*)/i;
    const parsed = slugName.match(re);
    if (parsed === null) {
        return [undefined, slugName];
    }
    return [parsed[1], parsed[2]];
}

function tryToSplitPath(paths: string) {
    const splitForward = paths.split("/");
    if (splitForward.length === 1) {
        const splitBack = paths.split("\\");
        if (splitBack.length > 1) {
            return splitBack;
        }
    }
    return splitForward;
}

export type PostDataType = "holo9w" | "holoism" | "posts";
interface IRemapFile {
    file: string;
    slug: Nullable<string>;
    rawDate: string;
    isDir: boolean;
}

export async function getAllPosts(type: PostDataType) {
    const finalPaths = path.join(root, "data", type, "**", "*").replace(/\\/g, "/");
    const allFiles = glob(finalPaths, { filesOnly: true }).filter((data) => data.endsWith("mdx"));

    const remappedFilesData: IRemapFile[] = allFiles.map((result) => {
        const fnSplit = tryToSplitPath(result);
        const [dateFromFile, fileItself] = parseSlug(fnSplit[fnSplit.length - 1]);

        if (result.startsWith(root)) {
            return {
                file: result,
                slug: fileItself ?? null,
                rawDate: "xxxx-xx-xx",
                isDir: true,
            };
        }
        if (typeof dateFromFile !== "undefined") {
            return {
                file: result,
                slug: fileItself ?? null,
                rawDate: dateFromFile,
                isDir: false,
            };
        }

        const { birthtime } = fs.statSync(path.join(root, result));
        return {
            file: result,
            slug: fileItself ?? null,
            rawDate: formatDateToYMD(birthtime),
            isDir: false,
        };
    });
    return remappedFilesData.filter((r) => !r.isDir);
}

export function formatSlug(slug: string) {
    return slug.replace(/\.(mdx|md)/, "");
}

export function dateSortDesc(a: string, b: string) {
    if (a > b) return -1;
    if (a < b) return 1;
    return 0;
}

export interface FrontMatterData {
    layout: string;
    slug: string;
    summary: string;
    fileName: string;
    date: string;
    url?: string;
    lastmod?: string;
    title: string;
    tags?: string[];
    images?: string[];
    locale?: string;
    draft?: boolean;
}
const VALID_FRONTMATTER = [
    "layout",
    "slug",
    "summary",
    "fileName",
    "date",
    "url",
    "lastmod",
    "title",
    "tags",
    "images",
    "locale",
    "draft",
];

type FrontMatterExtended = FrontMatterData & {
    file: string;
};

export interface RawBlogContent {
    mdxSource: string;
    frontMatter: FrontMatterData;
    extraData: { [key: string]: any };
}

export async function getFileBySlug(postData: FrontMatterExtended): Promise<RawBlogContent> {
    const source = fs.readFileSync(path.join(root, postData.file));
    const { data, content } = matter(source, {
        // @ts-ignore
        excerpt: excerptFormatter,
        excerpt_separator: "<!--more-->",
    });
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty("date")) {
        data.date = postData.date;
    }

    if (process.platform === "win32") {
        process.env.ESBUILD_BINARY_PATH = path.join(process.cwd(), "node_modules", "esbuild", "esbuild.exe");
    } else {
        process.env.ESBUILD_BINARY_PATH = path.join(
            process.cwd(),
            "node_modules",
            "esbuild",
            "bin",
            "esbuild"
        );
    }
    const realContent = content.replace("<!--more-->", "{/* more */}");

    const { code } = await bundleMDX({
        source: realContent,
        esbuildOptions: (options) => {
            options.loader = {
                ...options.loader,
                // @ts-ignore
                ".js": "jsx",
                // @ts-ignore
                ".ts": "tsx",
            };
            return options;
        },
    });
    const extraData: { [key: string]: any } = {};
    // @ts-ignore
    const frontmatterActual: FrontMatterData = {};
    for (const [key, value] of Object.entries(data)) {
        if (VALID_FRONTMATTER.includes(key)) {
            // @ts-ignore
            frontmatterActual[key] = value;
        } else {
            extraData[key] = value;
        }
    }
    if (!frontmatterActual.hasOwnProperty("layout")) {
        frontmatterActual.layout = "post";
    }

    const fnSplit = tryToSplitPath(postData.file);
    const fileName = fnSplit[fnSplit.length - 1] || postData.slug;

    return {
        mdxSource: code,
        frontMatter: {
            ...(frontmatterActual as FrontMatterData),
            fileName,
            date: formatDateToYMD(new Date(data.date)),
            slug: formatSlug(postData.slug) || "",
        },
        extraData,
    };
}

export async function getAllPostsFrontMatter(type: PostDataType): Promise<FrontMatterExtended[]> {
    const files = await getAllPosts(type);
    const allFrontMatter: FrontMatterExtended[] = [];
    files.forEach((file) => {
        const filePath = path.join(root, file.file);
        if (![".md", ".mdx", "md", "mdx"].includes(path.extname(filePath))) {
            return;
        }
        const source = fs.readFileSync(filePath, "utf8");
        const { data, excerpt } = matter(source, {
            // @ts-ignore
            excerpt: excerptFormatter,
            excerpt_separator: "<!--more-->",
        });
        // eslint-disable-next-line no-prototype-builtins
        if (!data.hasOwnProperty("layout")) {
            // does not have a layout, fuck that!
            console.error("[ERROR][getAllPostsFrontMatter]", filePath, "does not have a layout");
            return;
        }
        // eslint-disable-next-line no-prototype-builtins
        if (!data.hasOwnProperty("date")) {
            data.date = file.rawDate;
        }
        // eslint-disable-next-line no-prototype-builtins
        if (!data.hasOwnProperty("summary")) {
            data.summary = excerpt;
        }
        // let's override the slug
        if (typeof data.slug === "string") {
            allFrontMatter.push({
                ...(data as FrontMatterData),
                slug: formatSlug(data.slug),
                file: file.file,
            });
            return;
        }
        if (data.draft === true && process.env.NODE_ENV !== "development") {
            return;
        }
        allFrontMatter.push({
            ...(data as FrontMatterData),
            slug: formatSlug(file.slug as string),
            file: file.file,
        });
    });
    return allFrontMatter.sort((a, b) => dateSortDesc(a.date, b.date));
}
