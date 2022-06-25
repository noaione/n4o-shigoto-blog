import React from "react";
import Document, { Head, Html, Main, NextScript } from "next/document";

import { InlineJs } from "@kachkaev/react-inline-js";

const THEMECHECKERJS = `
// Helper
const isNullified = function(data) {
    return typeof data === "undefined" || data === null;
}

// Check for first user preferences.
let userPreferDark;
let systemPreferDark = false;
if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    systemPreferDark = true;
}

try {
    const themeStorage = localStorage.getItem("shigoto.theme");
    if (!isNullified(themeStorage)) {
        userPreferDark = themeStorage === "dark" ? true : false;
    }
} catch (e) {};
if (isNullified(userPreferDark)) {
    if (systemPreferDark) {
        localStorage.setItem("shigoto.theme", "dark");
    } else {
        localStorage.setItem("shigoto.theme", "light");
    }
} else {
    if (userPreferDark) {
        document.documentElement.classList.add("dark");
    }
}

// Theme toggler
const toggleTheme = function() {
    try {
        localStorage.setItem("shigoto.theme", isDark ? "light" : "dark");
    } catch (e) {};
};
`;

export default class ShigotoDocument extends Document {
    render() {
        return (
            <Html prefix="og: https://ogp.me/ns#">
                <Head>
                    <meta charSet="utf-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
                    <InlineJs code={THEMECHECKERJS} />
                    {/* Favicons */}
                    <link rel="shortcut icon" type="image/png" href="/assets/ico/favicon.png" />
                    <link rel="shortcut icon" href="/favicon.ico" />
                    <link rel="apple-touch-icon" sizes="57x57" href="/assets/ico/apple-icon-57x57.png" />
                    <link rel="apple-touch-icon" sizes="60x60" href="/assets/ico/apple-icon-60x60.png" />
                    <link rel="apple-touch-icon" sizes="72x72" href="/assets/ico/apple-icon-72x72.png" />
                    <link rel="apple-touch-icon" sizes="76x76" href="/assets/ico/apple-icon-76x76.png" />
                    <link rel="apple-touch-icon" sizes="114x114" href="/assets/ico/apple-icon-114x114.png" />
                    <link rel="apple-touch-icon" sizes="120x120" href="/assets/ico/apple-icon-120x120.png" />
                    <link rel="apple-touch-icon" sizes="144x144" href="/assets/ico/apple-icon-144x144.png" />
                    <link rel="apple-touch-icon" sizes="152x152" href="/assets/ico/apple-icon-152x152.png" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/assets/ico/apple-icon-180x180.png" />
                    <link
                        rel="icon"
                        type="image/png"
                        sizes="192x192"
                        href="/assets/ico/android-icon-192x192.png"
                    />
                    <link rel="icon" type="image/png" sizes="32x32" href="/assets/ico/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="96x96" href="/assets/ico/favicon-96x96.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/assets/ico/favicon-16x16.png" />
                    {/* Other */}
                    <link rel="alternate" type="application/rss+xml" href="/index.xml" />
                    <script defer async data-domain="shigoto.n4o.xyz" src="/js/kryptonite.js" />
                </Head>
                <body className="bg-white text-black dark:bg-gray-800 dark:text-gray-100">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
