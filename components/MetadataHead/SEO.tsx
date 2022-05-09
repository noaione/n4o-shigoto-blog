import React from "react";
import { Nullable, pickFirstLine } from "../../lib/utils";

import OpenGraphMeta from "./OpenGraph";
import TwitterCardsMeta from "./TwitterCard";

function isString(data: any): data is string {
    return typeof data === "string";
}

export interface SEOMetaProps {
    title?: string;
    description?: string;
    image?: Nullable<string>;
    urlPath?: string;
}

class SEOMetaTags extends React.Component<SEOMetaProps> {
    constructor(props: SEOMetaProps) {
        super(props);
    }

    render() {
        const { title, description, image, urlPath } = this.props;

        let realTitle = "Home";
        let realDescription = "Fansubber, Encoder, and “programmer”";
        let realImage = "https://shigoto.n4o.xyz/assets/img/social-card.png";
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

        let url = "https://shigoto.n4o.xyz";
        if (isString(urlPath)) {
            if (urlPath.startsWith("/")) {
                url += realUrl;
            } else {
                url += "/" + realUrl;
            }
        }

        return (
            <>
                {realDescription && <meta name="description" content={pickFirstLine(realDescription)} />}
                <link rel="canonical" href={url} />
                <OpenGraphMeta title={realTitle} description={realDescription} url={url} image={realImage} />
                <TwitterCardsMeta title={realTitle} description={realDescription} image={realImage} />
            </>
        );
    }
}

export default SEOMetaTags;
