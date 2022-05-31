import React from "react";

export interface DisqusThreadProps {
    identifier: string;
}

interface DisqusThreadState {
    scriptInject: string;
}

const SCRIPTINJECT = `
let disqus_config = function() {
    this.page.url = "{{ URL }}";
    this.page.identifier = "{{ IDENTIFIER }}";
};
(function() { // DON'T EDIT BELOW THIS LINE
    let s = document.createElement("script");
    s.src = "//n4oblog.disqus.com/embed.js";
    s.setAttribute("data-timestamp", new Date().getTime().toString());
    (document.head || document.body).appendChild(s);
})();
`;

export default class DisqusThread extends React.Component<DisqusThreadProps, DisqusThreadState> {
    constructor(props: DisqusThreadProps) {
        super(props);
        this.state = {
            scriptInject: "",
        };
    }

    async componentDidMount() {
        const baseUrl = window.location.href;

        let injectThis = SCRIPTINJECT.replace(/{{ URL }}/g, baseUrl);
        injectThis = injectThis.replace(/{{ IDENTIFIER }}/g, this.props.identifier);
        this.setState({ scriptInject: injectThis });
    }

    render(): React.ReactNode {
        return (
            <>
                <div id="disqus_thread"></div>
                <script
                    id="disqus_script"
                    dangerouslySetInnerHTML={{ __html: this.state.scriptInject }}
                ></script>
            </>
        );
    }
}
