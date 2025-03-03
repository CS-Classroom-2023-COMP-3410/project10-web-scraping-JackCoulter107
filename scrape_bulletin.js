const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');

const URL = 'https://bulletin.du.edu/undergraduate/majorsminorscoursedescriptions/traditionalbachelorsprogrammajorandminors/computerscience/#coursedescriptionstext';

async function scrapeCourses() {
    try {
        // Fetch the HTML content
        const { data } = await axios.get(URL);
        const $ = cheerio.load(data);

        let courses = [];

        // Select all course blocks
        $('.courseblock').each((index, element) => {
            let titleBlock = $(element).find('.courseblocktitle');
            let descBlock = $(element).find('.courseblockdesc');

            // Extract course title and code
            let courseTitleRaw = titleBlock.text().trim();
            let match = courseTitleRaw.match(/(COMP&nbsp;\d{4})\s(.*)\((\d+)\sCredits\)/);

            if (match) {
                let courseCode = match[1].replace('&nbsp;', ' '); // Fix spacing
                let courseTitle = match[2].trim();

                // Extract description and check for prerequisites
                let description = descBlock.text();
                let hasPrerequisite = descBlock.find('a').length > 0; // Check if a link (prerequisite) exists

                // Add only if there's NO prerequisite
                if (!hasPrerequisite) {
                    courses.push({
                        course: courseCode,
                        title: courseTitle
                    });
                }
            }
        });

        // Save to JSON
        const outputFilePath = 'results/bulletin.json';
        await fs.outputJson(outputFilePath, { courses }, { spaces: 4 });

        console.log(`✅ Successfully scraped ${courses.length} upper-division CS courses without prerequisites!`);
        console.log(`📁 Data saved in ${outputFilePath}`);
    } catch (error) {
        console.error("❌ Error scraping courses:", error);
    }
}

// Run the scraper
scrapeCourses();
