import LayoutHolo9Weeks from "./Holo9Song";
import LayoutHoloism from "./Holoism";
import LayoutMangaIndex from "./MangaIndex";
import LayoutReleaseBDMV from "./ReleaseBDMV";
import LayoutReleasePost from "./ReleasePost";

const LayoutLoader = {
    holo9song: LayoutHolo9Weeks,
    holoism: LayoutHoloism,
    post: LayoutReleasePost,
    bdmv: LayoutReleaseBDMV,
    manga: LayoutMangaIndex,
};

export type Layouts = keyof typeof LayoutLoader;

export default function getLayout(layout: Layouts) {
    return LayoutLoader[layout] || LayoutReleasePost;
}
