import React from "react";
import Document, { DocumentContext, Head, Html, Main, NextScript } from "next/document";

import { InlineJs } from "@kachkaev/react-inline-js";
import LightToggle from "@/components/LightToggle";

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
                </Head>
                <body className="bg-white text-black dark:bg-gray-800 dark:text-gray-100">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
