process.env.APIFY_LOCAL_STORAGE_DIR = "apify/omniscience_reader_viewpoint";
const Apify = require('apify');
const nodepub = require('nodepub');

(async function() {

    const baseURL = "https://www.lightnovelpub.com";
    const epub = nodepub.document({
        id: new Date().getTime(),
        cover: "covers/dukes_daughter.jpg",
        title: 'Common Sense of a Duke\'s Daughter',
        series: 'Common Sense of a Duke\'s Daughter',
        sequence: 1,
        author: 'Reia',
        fileAs: 'Reia',
        genre: 'Fiction',
        tags: 'Supernatural,Fantasy,Action',
        copyright: 'NovelPub, 2022',
        publisher: 'NovelPub',
        published: '2022-06-30',
        language: 'en',
        description: 'Common Sense of a Duke\'s Daughter',
        showContents: false,
        contents: 'Table of Contents',
        source: 'https://www.lightnovelpub.com/novel/common-sense-of-a-dukes-daughter-12032016/',
      });
    
    // Prepare a list of URLs to crawl
    const requestList = new Apify.RequestList({
        sources: [{ url: `${baseURL}/novel/common-sense-of-a-dukes-daughter-12032016/402-chapter-1` }],
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
            const content = [`<b>${title}</b><br />`];
            // Content
            $('article #chapter-container > p').each((_, el) => {
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
    await epub.writeEPUB("output", "Common Sense of a Duke's Daughter");
})();