const isDev = process.env.NODE_ENV !== "production";

/**
 * @type {import("next").NextConfig}
 */
const extendedProduction = {
    eslint: {
        dirs: ["pages", "components", "lib", "layouts"],
    },
    productionBrowserSourceMaps: true,
    swcMinify: true,
};

/**
 * @type {import("next").NextConfig}
 */
const baseConfig = {
    output: "export",
    reactStrictMode: true,
    pageExtensions: ["js", "jsx", "md", "mdx", "tsx", "ts"],
    images: {
        unoptimized: true,
        domains: [
            "j-novel.club",
            "sevenseasentertainment.com",
            "kodansha.us",
            "yenpress.com",
            "yenpress-us.imgix.net",
            "comikey.com",
            "fyre.cdn.sewest.net",
            "i1.wp.com",
            "books.google.com",
            "mangadex.com",
            "d2dq7ifhe7bu0f.cloudfront.net",
            "dhjhkxawhe8q4.cloudfront.net",
            "p.ihateani.me",
            "p.n4o.xyz",
            "puu.sh",
            "m.media-amazon.com",
        ],
    },
};

module.exports = isDev ? baseConfig : { ...baseConfig, ...extendedProduction };
