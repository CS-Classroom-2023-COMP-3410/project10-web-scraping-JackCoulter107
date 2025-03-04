const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const MAIN_URL = 'https://www.du.edu';
const EVENTS_URL = 'https://www.du.edu/calendar?search=&start_date=2025-01-01&end_date=2025-12-31';

async function fetchCalendarEvents() {
    try {
        const eventList = [];
        const { data: pageContent } = await axios.get(EVENTS_URL);
        const $ = cheerio.load(pageContent);

        const eventItems = $('.events-listing__item');

        console.log('🔍 Located ' + eventItems.length + ' events.');

        for (const item of eventItems) {
            const title = $(item).find('h3').text().trim();
            const date = $(item).find('p').first().text().trim();
            const time = $(item).find('.icon-du-clock').parent().text().replace('icon-du-clock', '').trim();
            const detailsPath = $(item).find('a.event-card').attr('href');

            let eventDescription;
            if (detailsPath) {
                try {
                    const fullDetailsURL = detailsPath.startsWith('http') ? detailsPath : MAIN_URL + detailsPath;
                    const { data: eventPage } = await axios.get(fullDetailsURL);
                    const $$ = cheerio.load(eventPage);

                    eventDescription = $$('.event-detail__description').text().trim() || undefined;
                } catch (fetchError) {
                    console.warn('Unable to retrieve details for ' + title + ': ' + fetchError.message);
                }
            }

            const eventData = {
                title: title,
                date: date
            };

            if (time) eventData.time = time;
            if (eventDescription) eventData.description = eventDescription;

            eventList.push(eventData);
        }

        fs.mkdirSync('results', { recursive: true });
        fs.writeFileSync(
            path.join('results', 'calendar.json'),
            JSON.stringify({ events: eventList }, null, 4)
        );

        console.log('✅ Successfully stored ' + eventList.length + ' events in results/calendar.json');
    } catch (mainError) {
        console.error('❌ Failed to scrape events:', mainError.message);
    }
}

fetchCalendarEvents();