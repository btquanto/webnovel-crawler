const Apify = require('apify');
const nodepub = require('nodepub');

(async function() {

    const baseURL = "https://jpmtl.com";
    const epub = nodepub.document({
        id: new Date().getTime(),
        cover: "covers/bookworm.jpg",
        title: 'Ascendance of a Bookworm',
        series: 'Ascendance of a Bookworm',
        sequence: 1,
        author: 'Miya Kazuki',
        fileAs: 'Cartlidge, KA',
        genre: 'Fiction',
        tags: 'Ascendance,Bookworm,Magic,Isekai,Supernatural',
        copyright: 'J-Novel Club, 2022',
        publisher: 'J-Novel Club',
        published: '2022-06-27',
        language: 'en',
        description: 'Ascendance of a bookworm.',
        showContents: false,
        contents: 'Table of Contents',
        source: 'https://jpmtl.com/books/141/',
      });
    
    // Prepare a list of URLs to crawl
    const requestList = new Apify.RequestList({
        sources: [{ url: `${baseURL}/books/141/35271` }],
    });
    const requestQueue = await Apify.openRequestQueue();

    await requestList.initialize();

    // Crawl the URLs
    const crawler = new Apify.CheerioCrawler({
        requestList,
        requestQueue,
        handlePageFunction: async ({ request, response, body, contentType, $ }) => {
            // Next URL
            const url = `${baseURL}${$('a.chapter-wrapper__nav:last-child').attr('href')}`;
            
            if (url != request.url) {
                (await requestQueue).addRequest({ url: url });
            }
            // Title
            const title = $('div.cnav-header__title > h1 > span:last-child').text();
            const content = [];
            // Content
            $('article .chapter-content__content > .cp-content > p').each((index, el) => {
                content.push($(el).text().replace(/^\s+|\s+$/g, ''));
            });
            console.log(request.url, title);
            epub.addSection(title, content.join("<br />"))
        },
    });

    await crawler.run();
    await epub.writeEPUB("output", "Ascendance of a Bookworm");
})();