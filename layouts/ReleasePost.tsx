import React from "react";
import LayoutReleaseBasePost from "./shared/_LayoutRelease";
import type { RawBlogContent } from "@/lib/mdx";

export default function LayoutReleasePost(props: RawBlogContent) {
    return <LayoutReleaseBasePost {...props} />;
}
