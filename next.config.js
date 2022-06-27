/**
 * @type {import("next").NextConfig}
 */
module.exports = {
    reactStrictMode: true,
    pageExtensions: ["js", "jsx", "md", "mdx", "tsx", "ts"],
    eslint: {
        dirs: ["pages", "components", "lib", "layouts"],
    },
    productionBrowserSourceMaps: true,
    images: {
        domains: [
            "j-novel.club",
            "sevenseasentertainment.com",
            "kodansha.us",
            "yenpress.com",
            "yenpress-us.imgix.net",
            "comikey.com",
            "i1.wp.com",
            "books.google.com",
            "d2dq7ifhe7bu0f.cloudfront.net",
            "dhjhkxawhe8q4.cloudfront.net",
            "p.ihateani.me",
            "p.n4o.xyz",
            "puu.sh",
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
};
