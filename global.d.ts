interface DisqusConfig {
    page: {
        identifier: string;
        url: string;
        title?: string;
        category_id?: string;
    };
}

interface Window {
    disqus_config: (this: DisqusConfig) => void;
}
