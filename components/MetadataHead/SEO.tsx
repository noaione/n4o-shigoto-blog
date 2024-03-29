import React from "react";
import { Nullable, pickFirstLine } from "@/lib/utils";

import OpenGraphMeta from "./OpenGraph";
import TwitterCardsMeta from "./TwitterCard";

import siteMetadata from "../../data/siteMetadata.json";

function isString(data: unknown): data is string {
    return typeof data === "string";
}

export interface SEOMetaProps {
    title?: string;
    description?: string;
    htmlDescription?: string;
    image?: Nullable<string>;
    urlPath?: string;
    smallImage?: boolean;
    siteName?: string;
}
const FALLBACKIMAGE = "/assets/img/nao250px.png";

class SEOMetaTags extends React.Component<SEOMetaProps> {
    constructor(props: SEOMetaProps) {
        super(props);
    }

    render() {
        const { title, description, image, urlPath, siteName } = this.props;
        let { smallImage } = this.props;

        let realTitle = "Home";
        let realDescription = siteMetadata.description;
        let realImage = FALLBACKIMAGE;
        let realUrl = null;
        if (isString(title)) {
            realTitle = title;
        }
        if (isString(description)) {
            realDescription = description;
        }
        if (isString(image)) {
            realImage = image;
        }
        if (isString(urlPath)) {
            realUrl = urlPath;
        }

        let baseUrl = siteMetadata.baseUrl;
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.slice(0, -1);
        }

        let url = baseUrl;
        if (isString(urlPath)) {
            if (urlPath.startsWith("/")) {
                url += realUrl;
            } else {
                url += "/" + realUrl;
            }
        }

        if (realImage === FALLBACKIMAGE) {
            smallImage = true;
        }

        const htmlDescription = this.props.htmlDescription || realDescription;

        return (
            <>
                {realDescription && <meta name="description" content={pickFirstLine(htmlDescription)} />}
                <link rel="canonical" href={url} />
                <OpenGraphMeta
                    title={realTitle}
                    description={realDescription}
                    url={url}
                    image={realImage}
                    siteName={siteName}
                />
                <TwitterCardsMeta
                    title={realTitle}
                    description={realDescription}
                    image={realImage}
                    smallImage={smallImage}
                />
            </>
        );
    }
}

export default SEOMetaTags;
