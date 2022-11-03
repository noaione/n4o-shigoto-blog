import React from "react";
import LayoutReleaseBasePost from "./shared/_LayoutRelease";
import type { RawBlogContent } from "@/lib/mdx";

export default function LayoutReleaseBDMV(props: RawBlogContent) {
    return <LayoutReleaseBasePost {...props} isBDMVFormat />;
}
