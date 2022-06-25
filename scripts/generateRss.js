const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const siteMetadata = require("../data/siteMetadata");

/**
 * @param {String} contents - The contents of to be rendered to HTML
 * @returns {String}
 */
async function markdownToHTML(contents) {
    const unified = (await import("unified")).unified;
    const parse = (await import("remark-parse")).default;
    const stringify = (await import("remark-html")).default;
    const result = await unified().use(parse).use(stringify).process(contents);
    return result.toString();
}

/**
 * Convert some string to html entities
 * @param {String} string
 * @returns {String}
 */
const convertStringToHTMLEntities = (string) => {
    return string.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
};

/**
 * Convert a slug into kebab case format
 * @param {String} str - The String to convert
 * @returns {String}
 */
const kebabCase = (str) =>
    str &&
    str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map((x) => x.toLowerCase())
        .join("-");

/**
 * Extract slug from filename that might contains date time.
 * @param {String} slugName The filename to be parsed
 * @returns {(String | undefined)[]} The parsed slug
 */
function parseSlug(slugName) {
    // eslint-disable-next-line no-useless-escape
    const re = /([0-9]{4}\-[0-9]{1,2}\-[0-9]{1,2})?\-?(.*)/i;
    const parsed = slugName.match(re);
    if (parsed === null) {
        return [undefined, slugName];
    }
    return [parsed[1], parsed[2]];
}

/**
 * Split paths into a list of directory.
 * @param {String} paths - The path to split
 * @returns {String[]} The list of directories
 */
function tryToSplitPath(paths) {
    let splitForward = paths.split("/");
    if (splitForward.length === 1) {
        let splitBack = paths.split("\\");
        if (splitBack.length > 1) {
            return splitBack;
        }
    }
    return splitForward;
}

/**
 * Get the first line of a string
 * @param {String} textData - The string to be processed
 * @returns {String} The first line found
 */
function findFirstLine(textData) {
    for (let i = 0; i < textData.length; i++) {
        const clean = textData[i].replace(/\r/, "");
        if (clean.replace(/\s/, "").length > 0) {
            return clean;
        }
    }
    return "";
}

/**
 *
 */
function formatSeparators(textData, separators) {
    if (typeof separators !== "string") {
        return findFirstLine(textData);
    }
    const joinedText = [];
    for (let i = 0; i < textData.length; i++) {
        const clean = textData[i].replace(/\r/, "");
        if (clean === separators) {
            break;
        }
        joinedText.push(clean);
    }
    // Bruh
    if (joinedText.length === textData.length) {
        return findFirstLine(textData);
    }
    return joinedText.join("\n");
}

/**
 * @param {import("gray-matter").Input} file The input file
 */
function excerptFormatter(file, options) {
    file.excerpt = formatSeparators(file.content.split("\n"), options.excerpt_separator);
}

/**
 *
 */
function dateSortDesc(a, b) {
    if (a > b) return -1;
    if (a < b) return 1;
    return 0;
}

function safelyEncodeUrl(url) {
    const splitUrl = url.split("/");
    const lastUrl = encodeURIComponent(splitUrl[splitUrl.length - 1]);
    return splitUrl.slice(0, splitUrl.length - 1).join("/") + "/" + lastUrl;
}

/**
 * Generate a single item posts
 * @param {import("../lib/mdx").FrontMatterData} post - The post to generate the RSS item for
 */
async function generateRSSXMLItem(post) {
    const basePath = siteMetadata.baseUrl;
    const postPath = basePath + "r/" + post.slug;
    const { images } = post;
    /** @type {String | undefined} */
    let featured;
    if (Array.isArray(images) && images.length > 0) {
        featured = safelyEncodeUrl(images[0]);
        if (featured.startsWith("/")) {
            featured = `${basePath.slice(0, basePath.length - 1)}${featured}`;
        }
    }

    return `
      <item>
        <title>${convertStringToHTMLEntities(post.title)}</title>
        ${
            post.excerpt
                ? `<description><![CDATA[${(
                      await markdownToHTML(convertStringToHTMLEntities(post.excerpt))
                  ).trim()}]]></description>`
                : ""
        }
        <pubDate>${new Date(post.date).toUTCString()}</pubDate>
        <author>${siteMetadata.author}</author>${
        typeof featured === "string" ? `\n        <media:thumbnail url="${featured}" />` : ""
    }${typeof featured === "string" ? `\n        <media:content url="${featured}" medium="image" />` : ""}
        <link>${postPath}</link>
        <guid>${postPath}</guid>
        ${post.tags
            .map((tag) => {
                return `<category>${tag}</category>`;
            })
            .join("\n        ")}
      </item>`;
}

/**
 * Generate a XML of an RSS feed
 * @param {import("../lib/mdx").FrontMatterData[]} validPosts - The post to generate the RSS item for
 */
async function generateRSSXML(validPosts) {
    const firstPost = validPosts[0];
    let lbd;
    if (firstPost.hasOwnProperty("lastmod")) {
        lbd = new Date(firstPost.lastmod).toUTCString();
    } else if (firstPost.hasOwnProperty("date")) {
        lbd = new Date(firstPost.date).toUTCString();
    } else {
        lbd = new Date().toUTCString();
    }

    const mappedFiles = [];
    for (let i = 0; i < validPosts.length; i++) {
        const post = validPosts[i];
        mappedFiles.push(await generateRSSXMLItem(post));
    }

    return `
  <rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" version="2.0">
    <channel>
      <title>${convertStringToHTMLEntities(siteMetadata.title)}</title>
      <link>${siteMetadata.baseUrl}</link>
      <description>${convertStringToHTMLEntities(siteMetadata.description)}</description>
      <language>en</language>
      <managingEditor>${siteMetadata.email} (${siteMetadata.author})</managingEditor>
      <webMaster>${siteMetadata.email} (${siteMetadata.author})</webMaster>
      <lastBuildDate>${lbd}</lastBuildDate>
      <generator>NextJS/Vercel</generator>
      <atom:link href="${siteMetadata.baseUrl}index.xml" rel="self" type="application/rss+xml" />
      ${mappedFiles.join("")}
    </channel>
  </rss>
    `;
}

(async () => {
    const globby = (await import("tiny-glob")).default;

    const mdxPosts = await globby("data/posts/*.mdx");
    const mdPosts = await globby("data/posts/*.md");

    const posts = [...mdPosts, ...mdxPosts];

    /**
     * @type {import("../lib/mdx").FrontMatterData[]}
     */
    const filteredPosts = [];

    posts.forEach((post) => {
        const fnSplit = tryToSplitPath(post);

        const [fileDate, fileSlug] = parseSlug(fnSplit[fnSplit.length - 1]);
        const slug = fileSlug.replace(/\.mdx?$/, "");

        const fileName = fnSplit[fnSplit.length - 1] || slug;

        const src = fs.readFileSync(path.join(process.cwd(), post));
        const { data, excerpt } = matter(src, {
            excerpt: excerptFormatter,
            excerpt_separator: "<!--more-->",
        });

        // eslint-disable-next-line no-prototype-builtins
        if (!data.hasOwnProperty("date") && dateFromFile) {
            data.date = dateFromFile;
        }
        // eslint-disable-next-line no-prototype-builtins
        if (!data.hasOwnProperty("excerpt") && typeof excerpt === "string") {
            data.excerpt = excerpt;
        }

        const allTags = [];
        /** @type {String[] | undefined} */
        const postTags = data.tags;
        if (Array.isArray(postTags)) {
            postTags.forEach((tag) => {
                allTags.push(kebabCase(tag));
            });
        }

        filteredPosts.push({
            ...data,
            slug,
            tags: allTags,
            fileName,
        });
    });

    const fullPath = path.join(process.cwd(), "public/index.xml");
    const xml = await generateRSSXML(filteredPosts);
    console.info(`Generating RSS feed to ${fullPath}`);
    await fs.promises.writeFile(fullPath, xml);
})();
