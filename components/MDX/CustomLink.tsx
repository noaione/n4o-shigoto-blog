import Link, { LinkProps } from "next/link";

function isS(s: string | unknown): s is string {
    return typeof s === "string" && s.length > 0;
}

type NextLink = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & LinkProps;

interface CustomLinkProps extends NextLink {
    locale?: string;
}

const CustomLink = ({ href, locale, ...rest }: CustomLinkProps) => {
    const isInternalLink = href && href.toString().startsWith("/");
    const isAnchorLink = href && href.toString().startsWith("#");
    const { className, ...realRest } = rest;

    if (isInternalLink) {
        return (
            <Link
                href={href}
                locale={locale}
                className={`break-words ${isS(className) ? className : ""}`}
                {...realRest}
            />
        );
    }

    if (isAnchorLink) {
        return (
            <a
                href={href.toString()}
                className={`break-words ${isS(className) ? className : ""}`}
                {...realRest}
            />
        );
    }

    return (
        <a
            target="_blank"
            rel="noopener noreferrer"
            href={href.toString()}
            className={`break-words ${isS(className) ? className : ""}`}
            {...realRest}
        />
    );
};

export default CustomLink;
