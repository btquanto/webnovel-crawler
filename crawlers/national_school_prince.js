process.env.APIFY_LOCAL_STORAGE_DIR = "apify/national_school_prince";
const Apify = require('apify');
const nodepub = require('nodepub');

(async function() {

    const baseURL = "https://www.novelpub.com";
    const epub = nodepub.document({
        id: new Date().getTime(),
        cover: "covers/national_school_prince.jpg",
        title: 'National School Prince is a girl',
        series: 'National School Prince is a girl',
        sequence: 1,
        author: 'Warring Young Seven',
        fileAs: 'Warring Young Seven',
        genre: 'Fiction',
        tags: 'Supernatural,Gender Bender,Shoujo,School life',
        copyright: 'NovelPub, 2022',
        publisher: 'NovelPub',
        published: '2022-06-27',
        language: 'en',
        description: 'National School Prince is a girl',
        showContents: false,
        contents: 'Table of Contents',
        source: 'https://www.novelpub.com/novel/national-school-prince-is-a-girl-25060131',
      });
    
    // Prepare a list of URLs to crawl
    const requestList = new Apify.RequestList({
        sources: [{ url: `${baseURL}/novel/national-school-prince-is-a-girl-25060131/273-chapter-1` }],
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
                if(!!text && text.toLowerCase().indexOf("novelpub.com") < 0) {
                    content.push(text);
                }
            });
            console.log(request.url, title);
            epub.addSection(title, content.join("<br />"))
        },
    });

    await crawler.run();
    await epub.writeEPUB("output", "National School Prince is a girl");
})();