import { isNone } from "@/lib/utils";
import React from "react";

const EMBED_URL = "https://panel.naoti.me/embed";
type AccentColor = "red" | "yellow" | "green" | "blue" | "indigo" | "purple" | "pink" | "none";

interface IEmbedProps {
    serverId: string;
    accentColor?: AccentColor;
}

interface IEmbedState {
    ready: boolean;
    initialDarkMode: boolean;
}

export default class NaoTimesEmbed extends React.Component<IEmbedProps, IEmbedState> {
    iframeRef: React.RefObject<HTMLIFrameElement>;
    darkObserver?: MutationObserver;
    firstRun?: boolean;

    constructor(props: IEmbedProps) {
        super(props);
        this.iframeRef = React.createRef();
        this.listenHeightChange = this.listenHeightChange.bind(this);
        this.publishDarkMode = this.publishDarkMode.bind(this);
        this.firstRun = true;
        this.state = {
            ready: false,
            initialDarkMode: false,
        };
    }

    listenHeightChange(ev: MessageEvent<string>) {
        const frameRef = this.iframeRef;
        // Periksa apakah pesan dari embed naotimes apa tidak
        if (!ev.origin.startsWith("https://panel.naoti.me")) {
            return;
        }

        const data = JSON.parse(ev.data);
        if (!isNone(frameRef)) {
            if (data.action === "resize") {
                if (frameRef.current) {
                    frameRef.current.height = `${data.height}`;
                    // Hilangkan scrollbar
                    frameRef.current.style.overflowY = "hidden";
                }
                // iframe.scrolling = "no";
            }
        }
    }

    publishDarkMode(darkMode: boolean) {
        // use promise until frame ref is ready
        const dataToSend = JSON.stringify({ action: "setDark", target: darkMode ? "true" : "false" });
        const frameRef = this.iframeRef;
        if (!isNone(frameRef) && frameRef.current) {
            frameRef.current.contentWindow?.postMessage(dataToSend, "*");
        }
    }

    componentDidMount() {
        window.addEventListener("message", this.listenHeightChange);
        const btnToggler = document.getElementById("light-toggler") as HTMLButtonElement | null;
        if (btnToggler) {
            this.darkObserver = new MutationObserver((mutList) => {
                mutList.forEach((mut) => {
                    if (mut.type === "attributes" && mut.attributeName == "dark-mode") {
                        const target = mut.target as HTMLButtonElement;
                        const darkMode = target.getAttribute("dark-mode") === "dark";
                        this.publishDarkMode(darkMode);
                    }
                });
            });
            this.darkObserver.observe(btnToggler, { attributes: true });
        }
        const isDarkMode = document.getElementsByTagName("html")[0].className.includes("dark");
        this.setState({ ready: true, initialDarkMode: isDarkMode });
    }

    componentWillUnmount() {
        window.removeEventListener("message", this.listenHeightChange);
        if (this.darkObserver) {
            this.darkObserver.disconnect();
        }
    }

    render() {
        let actualUrl = `${EMBED_URL}?id=${this.props.serverId}&dark=${this.state.initialDarkMode}`;
        actualUrl += this.props.accentColor ? `&accent=${this.props.accentColor}` : "";
        return (
            <div id="naotimes">
                {this.state.ready && (
                    <iframe
                        id="naotimes-embed"
                        ref={this.iframeRef}
                        src={actualUrl}
                        seamless
                        className="block w-screen max-w-full m-0 p-0 border-none overflow-y-hidden"
                    />
                )}
            </div>
        );
    }
}
