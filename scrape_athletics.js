const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');

const URL = 'https://denverpioneers.com/calendar';

async function scrapeAthleticEvents() {
    try {
        // Fetch the HTML content
        const { data } = await axios.get(URL);
        const $ = cheerio.load(data);

        let events = [];

        // Select all event blocks
        $('.calendar-event').each((index, element) => {
            // Extract event date and time
            let dateTime = $(element).find('.calendar-date').text().trim();

            // Extract DU team and opponent team names
            let teamsText = $(element).find('.calendar-opponent').text().trim();
            let [duTeam, opponent] = teamsText.split(' vs. ');

            // Clean and format the extracted data
            duTeam = duTeam ? duTeam.trim() : 'University of Denver';
            opponent = opponent ? opponent.trim() : 'TBD';

            // Add the event to the list
            events.push({
                duTeam,
                opponent,
                date: dateTime
            });
        });

        // Save to JSON
        const outputFilePath = 'results/athletics.json';
        await fs.outputJson(outputFilePath, { events }, { spaces: 4 });

        console.log(`✅ Successfully scraped ${events.length} upcoming athletic events!`);
        console.log(`📁 Data saved in ${outputFilePath}`);
    } catch (error) {
        console.error("❌ Error scraping athletic events:", error);
    }
}

// Run the scraper
scrapeAthleticEvents();
