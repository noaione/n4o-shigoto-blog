import React from "react";

import LightBulbOff from "./Icons/LightBulbOutline";
import LightBulbOn from "./Icons/LightBulb";

import { isNone } from "@/lib/utils";

interface LightState {
    isDark?: boolean;
}

type NoProps = object;

export default class LightToggle extends React.Component<NoProps, LightState> {
    constructor(props: NoProps) {
        super(props);
        this.toggleDarkMode = this.toggleDarkMode.bind(this);

        this.state = {
            isDark: false,
        };
    }

    componentDidMount() {
        let userPreferDark: boolean | undefined;
        let systemPreferDark = false;
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            systemPreferDark = true;
        }

        try {
            const themeStorage = localStorage.getItem("shigoto.theme");
            if (!isNone(themeStorage)) {
                userPreferDark = themeStorage === "dark" ? true : false;
            }
        } catch (err) {
            console.error(err);
        }

        if (isNone(userPreferDark)) {
            if (systemPreferDark) {
                this.setState({ isDark: true });
            } else {
                this.setState({ isDark: false });
            }
        } else {
            if (userPreferDark) {
                this.setState({ isDark: true });
            }
        }
    }

    componentDidUpdate() {
        const { isDark } = this.state;
        const root = window.document.documentElement;
        if (isDark) {
            if (!root.classList.contains("dark")) {
                root.classList.add("dark");
            }
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("shigoto.theme", isDark ? "dark" : "light");
    }

    toggleDarkMode() {
        this.setState((prevState) => ({ isDark: !prevState.isDark }));
    }

    render() {
        return (
            <>
                <div className="flex items-end justify-end fixed bottom-0 right-0 mb-6 mr-6 z-10">
                    <div
                        className="bg-gray-700 dark:bg-gray-300 border-4 border-gray-700 dark:border-gray-300 hover:border-gray-500 dark:hover:border-gray-500 transition duration-300 p-4 flex flex-col justify-center items-center rounded-full cursor-pointer"
                        onClick={this.toggleDarkMode}
                    >
                        <button
                            id="light-toggler"
                            className="focus:outline-none items-center h-6 w-6 m-auto"
                            dark-mode={this.state.isDark ? "dark" : "light"}
                        >
                            {this.state.isDark ? (
                                <LightBulbOff className="h-6 w-6 m-auto text-black" />
                            ) : (
                                <LightBulbOn className="h-5 w-5 m-auto text-white" />
                            )}
                        </button>
                    </div>
                </div>
            </>
        );
    }
}
