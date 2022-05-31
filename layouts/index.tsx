import LayoutHolo9Weeks from "./Holo9Song";
import LayoutReleaseBDMV from "./ReleaseBDMV";
import LayoutReleasePost from "./ReleasePost";

const LayoutLoader = {
    holo9song: LayoutHolo9Weeks,
    post: LayoutReleasePost,
    bdmv: LayoutReleaseBDMV,
};

export type Layouts = keyof typeof LayoutLoader;

export default function getLayout(layout: Layouts) {
    return LayoutLoader[layout] || LayoutReleasePost;
}
