import React from "react";
import { pickFirstLine } from "@/lib/utils";

interface TwitterCardProps {
    image?: string;
    title: string;
    description: string;
    smallImage?: boolean;
}

class TwitterCardsMeta extends React.Component<TwitterCardProps> {
    constructor(props: TwitterCardProps) {
        super(props);
    }

    render() {
        const { title, description, image, smallImage } = this.props;

        const realTitle = title || "N4O Shigoto";
        const realImage = image || "/assets/img/social-card.png";

        return (
            <>
                {!smallImage && <meta name="twitter:card" content="summary_large_image" />}
                <meta name="twitter:creator" content="@nao0809_" />
                <meta name="twitter:title" content={realTitle} />
                {description && <meta property="twitter:description" content={pickFirstLine(description)} />}
                {realImage && <meta property="twitter:image" content={realImage} />}
            </>
        );
    }
}

export default TwitterCardsMeta;
