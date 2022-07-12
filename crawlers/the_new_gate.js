process.env.APIFY_LOCAL_STORAGE_DIR = "apify/the_new_gate";
const Apify = require('apify');
const nodepub = require('nodepub');
const volumes = require('../data/the_new_gate');

(async function() {

    const baseURL = "https://shintranslations.com/";
    const epub = nodepub.document({
        id: new Date().getTime(),
        cover: "covers/the_new_gate.jpg",
        title: 'The New Gate',
        series: 'The New Gate',
        sequence: 1,
        author: 'Miya Kazuki',
        fileAs: 'Cartlidge, KA',
        genre: 'Fiction',
        tags: 'Magic,Isekai,Supernatural,Game',
        copyright: 'J-Novel Club, 2022',
        publisher: 'J-Novel Club',
        published: '2022-06-27',
        language: 'en',
        description: 'The New Gate.',
        showContents: false,
        contents: 'Table of Contents',
        source: 'https://shintranslations.com/the-new-gate-toc/',
      });
    
    for(let volume of volumes) {
        epub.addSection(volume.title, "");
        for(let chapter of volume.chapters) {
            console.log(chapter.title, chapter.href);

            const content = [chapter.title];
            const requestList = new Apify.RequestList({
                sources: [{ url: chapter.href }],
            });
            await requestList.initialize();
            const tocCrawler = new Apify.CheerioCrawler({
                requestList: await (async () => {
                    
                    return requestList;
                })(),
                handlePageFunction: async ({ request, response, body, contentType, $ }) => {
                    for(let p of $("div.content-area > div.text-formatting > p")) {
                        const textContent = $(p).text()
                        if (textContent.includes("Next→")) {
                            break;
                        }
                        if(textContent) {
                            content.push(textContent);
                        }
                    }
                },
            });
            await tocCrawler.run();
            console.log(content.length);
            epub.addSection(chapter.title, content.map(p => `<p>${p}</p>`));
        }
    }

    await epub.writeEPUB("output", "The New Gate");
})();