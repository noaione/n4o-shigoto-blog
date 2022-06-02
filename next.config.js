module.exports = {
    reactStrictMode: true,
    pageExtensions: ["js", "jsx", "md", "mdx", "tsx", "ts"],
    eslint: {
        dirs: ["pages", "components", "lib", "layouts"],
    },
    productionBrowserSourceMaps: true,
    async rewrites() {
        return {
            afterFiles: [
                {
                    source: "/js/kryptonite.js",
                    destination: "https://tr.n4o.xyz/js/plausible.js",
                },
            ],
        };
    },
};
