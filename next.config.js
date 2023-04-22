const isDev = process.env.NODE_ENV !== "production";

/**
 * @type {import("next").NextConfig}
 */
const extendedProduction = {
    eslint: {
        dirs: ["pages", "components", "lib", "layouts"],
    },
    productionBrowserSourceMaps: true,
};

/**
 * @type {import("next").NextConfig}
 */
const baseConfig = {
    reactStrictMode: true,
    pageExtensions: ["js", "jsx", "md", "mdx", "tsx", "ts"],
    images: {
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
    async rewrites() {
        return {
            afterFiles: [
                {
                    source: "/js/kryptonite.js",
                    destination: "https://tr.n4o.xyz/js/plausible.js",
                },
                {
                    source: "/api/event",
                    destination: "https://tr.n4o.xyz/api/event",
                },
            ],
        };
    },
    async redirects() {
        return [
            {
                source: "/feed.xml",
                destination: "/index.xml",
                permanent: true,
            },
        ];
    },
};

module.exports = isDev ? baseConfig : { ...baseConfig, ...extendedProduction };
