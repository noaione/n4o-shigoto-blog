import React, { useEffect, useRef } from "react";

export interface DisqusThreadProps {
    identifier: string;
}

export default function DisqusThread(props: DisqusThreadProps) {
    const { identifier } = props;
    const disqusElement = useRef<HTMLDivElement>(null);
    const scriptWindow = useRef<HTMLScriptElement>();

    useEffect(() => {
        console.log("DisqusThread:", identifier, window.location.href);

        const tempWindow = window.document.createElement("script");

        tempWindow.async = true;
        tempWindow.src = "//n4oblog.disqus.com/embed.js";
        tempWindow.setAttribute("data-timestamp", new Date().getTime().toString());

        window.disqus_config = function () {
            this.page.url = window.location.href;
            this.page.identifier = identifier;
        };
        scriptWindow.current = tempWindow;

        // Attach to head/body
        (document.head || document.body).appendChild(tempWindow);

        return () => {
            // Cleanup
            if (scriptWindow.current) {
                scriptWindow.current.remove();

                if (disqusElement.current) {
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                    disqusElement.current.innerHTML = "";
                }
            }
        };
    }, [identifier, scriptWindow]);

    return <div id="disqus_thread" ref={disqusElement}></div>;
}
