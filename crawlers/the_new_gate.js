process.env.APIFY_LOCAL_STORAGE_DIR = "apify/the_new_gate";
const Apify = require('apify');
const nodepub = require('nodepub');
const volumes = require('../data/the_new_gate');

(async function() {

    const epub = nodepub.document({
        id: new Date().getTime(),
        cover: "covers/the_new_gate.jpg",
        title: 'The New Gate',
        series: 'The New Gate',
        sequence: 1,
        author: 'Kazanami Shinogi',
        fileAs: 'Cartlidge, KA',
        genre: 'Fiction',
        tags: 'Magic,Isekai,Supernatural,Game',
        copyright: 'Shin Translations, 2022',
        publisher: 'Shin Translations',
        published: '2022-07-12',
        language: 'en',
        description: 'The New Gate.',
        showContents: false,
        contents: 'Table of Contents',
        source: 'https://shintranslations.com/the-new-gate-toc/',
      });
    
    for(let volume of volumes) {
        epub.addSection(volume.title, `
            <!DOCTYPE html>
            <html>
            <head></head>
            <body>
            <p style="position: absolute; top: 30%; left: 50%; transform: translateX(-50%); font-size: 48px; font-weight: bold">
                ${volume.title}
            </p>
            </body>
            </html>
        `);
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
            epub.addSection(chapter.title, `
                <!DOCTYPE html>
                <html>
                <head></head>
                <body>
                    ${content.map(p => `<p>${p}</p>`).join("\n")}
                </body>
                </html>
            `);
        }
    }

    await epub.writeEPUB("output", "The New Gate");
})();