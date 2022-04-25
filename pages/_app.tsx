import React from "react";
import Router from "next/router";
import ProgressBar from "@badrap/bar-of-progress";

import "../styles/main.css";
import type { AppProps } from "next/app";
import LightToggle from "@/components/LightToggle";

const progress = new ProgressBar({
    size: 2,
    color: "#102E52",
    className: "z-[99]",
    delay: 80,
});

Router.events.on("routeChangeStart", (url) => {
    console.log(`Loading: ${url}`);
    progress.start();
});
Router.events.on("routeChangeComplete", () => progress.finish());
Router.events.on("routeChangeError", () => progress.finish());

export default function ShigotoApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Component {...pageProps} />
            <LightToggle />
        </>
    );
}
