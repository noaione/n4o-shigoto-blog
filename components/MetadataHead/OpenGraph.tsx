import React from "react";

interface OpenGraphProps {
    image?: string;
    title: string;
    url: string;
    description: string;
}
const FALLBACKIMAGE = "/assets/img/nao250px.png";

class OpenGraphMeta extends React.Component<OpenGraphProps> {
    constructor(props: OpenGraphProps) {
        super(props);
    }

    render() {
        const { title, description, url, image } = this.props;

        const realUrl = url || "https://shigoto.n4o.xyz/";
        const realImage = image || FALLBACKIMAGE;

        return (
            <>
                <meta name="theme-color" content="#F4E5B1" />
                <meta name="msapplication-TileColor" content="#F4E5B1" />
                {title && <meta property="og:title" content={title} />}
                {description && <meta property="og:description" content={description} />}
                {realImage && <meta property="og:image" content={realImage} />}
                <meta property="og:url" content={realUrl} />
                <meta property="og:site_name" content="N4O Shigoto" />
                <meta property="og:type" content="website" />
            </>
        );
    }
}

export default OpenGraphMeta;
