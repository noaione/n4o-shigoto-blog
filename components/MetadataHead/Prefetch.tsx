import React from "react";

interface PrefetchProps {
    extras?: string[];
}

export default function HeaderPrefetch(props: PrefetchProps) {
    const { extras } = props;
    return (
        <>
            {/* Preconnect and DNS-Prefetch */}
            {/* ihateani.me CDN */}
            <link rel="preconnect" href="https://p.ihateani.me" />
            <link rel="dns-prefetch" href="https://p.ihateani.me" />
            {/* N4O CDN */}
            <link rel="preconnect" href="https://p.n4o.xyz" />
            <link rel="dns-prefetch" href="https://p.n4o.xyz" />
            {extras &&
                extras.map((extra) => {
                    return (
                        <React.Fragment key={extra}>
                            <link rel="preconnect" href={extra} />
                            <link rel="dns-prefetch" href={extra} />
                        </React.Fragment>
                    );
                })}
        </>
    );
}
