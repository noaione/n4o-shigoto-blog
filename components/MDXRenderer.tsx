import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";

import CustomLink from "./MDX/CustomLink";

const MDXComponents = {
    Link: CustomLink,
};

interface LayoutRender {
    mdxSource: string;
}

export default function MDXRenderer({ mdxSource }: LayoutRender) {
    const CompiledMDX = useMemo(() => getMDXComponent(mdxSource), [mdxSource]);

    // @ts-ignore
    return <CompiledMDX components={MDXComponents} />;
}
