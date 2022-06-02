import fs from "fs";
import matter from "gray-matter";
import path from "path";

import { getAllPosts, PostDataType } from "./mdx";

const root = process.cwd();

export interface TagCount {
    count: number;
}

export async function getAllTags(type: PostDataType) {
    const files = await getAllPosts(type);

    const tagCount: { [key: string]: TagCount } = {};
    // Iterate through each post, putting all found tags into `tags`
    files.forEach((file) => {
        const source = fs.readFileSync(path.join(root, file.file), "utf8");
        const { data } = matter(source);
        // eslint-disable-next-line no-prototype-builtins
        if (!data.hasOwnProperty("date")) {
            data.date = file.rawDate;
        }
        if (data.tags && data.draft !== true) {
            data.tags.forEach((tag: string) => {
                if (tag in tagCount) {
                    tagCount[tag]["count"] += 1;
                } else {
                    tagCount[tag] = { count: 1 };
                }
            });
        }
    });
    return tagCount;
}
