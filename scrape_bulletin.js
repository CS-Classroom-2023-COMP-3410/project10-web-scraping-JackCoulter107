const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');

const URL = 'https://bulletin.du.edu/undergraduate/majorsminorscoursedescriptions/traditionalbachelorsprogrammajorandminors/computerscience/#coursedescriptionstext';

async function scrapeCourses() {
    try {
        console.log('🔄 Fetching DU Bulletin page...');
        const { data } = await axios.get(URL);
        const $ = cheerio.load(data);

        // Check if we are correctly selecting the container
        const courseContainer = $('#coursedescriptionstextcontainer');

        if (courseContainer.length === 0) {
            console.log('❌ Could not find #coursedescriptionstextcontainer. The structure might be different.');
            return;
        }

        console.log('✅ Found #coursedescriptionstextcontainer. Checking course blocks...');

        const courses = [];

        courseContainer.find('.courseblock').each((index, element) => {
            const courseTitleBlock = $(element).find('.courseblocktitle');
            const courseDescBlock = $(element).find('.courseblockdesc');

            if (courseTitleBlock.length) {
                let courseText = courseTitleBlock.text().trim().replace(/\s+/g, ' ');
                
                // Debugging: Print course title block text
                console.log(`📌 Found Course Block: ${courseText}`);

                let match = courseText.match(/(COMP(?:\s|&nbsp;)(\d+))\s(.*)/);

                if (match) {
                    let courseCode = match[1].replace('&nbsp;', ' ');  // Handle &nbsp;
                    let courseNumber = parseInt(match[2]);
                    let courseTitle = match[3];

                    // Debugging: Print extracted course info
                    console.log(`📖 Course: ${courseCode}, Title: ${courseTitle}`);

                    if (courseNumber >= 3000) {
                        const hasPrereq = courseDescBlock.find('a').length > 0;

                        if (!hasPrereq) {
                            courses.push({ course: courseCode, title: courseTitle });
                        }
                    }
                } else {
                    console.log('⚠️ Course title did not match expected format:', courseText);
                }
            }
        });

        // Save results
        const resultPath = './results/bulletin.json';
        await fs.ensureDir('./results');
        await fs.writeJson(resultPath, { courses }, { spaces: 2 });

        console.log(`✅ Scraped ${courses.length} upper-division CS courses without prerequisites.`);
    } catch (error) {
        console.error('❌ Error scraping DU Bulletin:', error);
    }
}

// Run the scraper
scrapeCourses();