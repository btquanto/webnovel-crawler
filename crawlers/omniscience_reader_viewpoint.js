process.env.APIFY_LOCAL_STORAGE_DIR = "apify/omniscience_reader_viewpoint";
const Apify = require('apify');
const nodepub = require('nodepub');

(async function() {

    const baseURL = "https://www.lightnovelpub.com";
    const epub = nodepub.document({
        id: new Date().getTime(),
        cover: "covers/omniscience_reader_viewpoint.jpg",
        title: 'Omniscience Reader Viewpoint',
        series: 'Omniscience Reader Viewpoint',
        sequence: 1,
        author: 'Sing-Shong',
        fileAs: 'Sing-Shong',
        genre: 'Fiction',
        tags: 'Supernatural,Fantasy,Action',
        copyright: 'NovelPub, 2022',
        publisher: 'NovelPub',
        published: '2022-06-27',
        language: 'en',
        description: 'Omniscience Reader Viewpoint',
        showContents: false,
        contents: 'Table of Contents',
        source: 'https://www.lightnovelpub.com/novel/orv-wn-25060131',
      });
    
    // Prepare a list of URLs to crawl
    const requestList = new Apify.RequestList({
        sources: [{ url: `${baseURL}/novel/orv-wn-25060131/265-chapter-1` }],
    });
    const requestQueue = await Apify.openRequestQueue();

    await requestList.initialize();

    // Crawl the URLs
    const crawler = new Apify.CheerioCrawler({
        requestList,
        requestQueue,
        handlePageFunction: async ({ request, response, body, contentType, $ }) => {
            // Next URL
            const next = $('a.nextchap:not(.isDisabled)').attr('href');
            if(next) {
                const url = `${baseURL}${next}`;
                if (url != request.url) {
                    (await requestQueue).addRequest({ url: url });
                }
            };
        
            // Title
            const title = $('article > section div.titles > h1 > span.chapter-title').text();
            const content = [title];
            // Content
            $('article #chapter-container > p').each((index, el) => {
                const text = $(el).text().replace(/^\s+|\s+$/g, '');
                if(!!text && text.toLowerCase().indexOf("lightnovelpub.com") < 0) {
                    content.push(text);
                }
            });
            console.log(request.url, title);
            epub.addSection(title, content.join("<br />"))
        },
    });

    await crawler.run();
    await epub.writeEPUB("output", "Omniscience Reader Viewpoint");
})();