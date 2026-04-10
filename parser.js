import db from "./js/db.js";
import { JSDOM } from "jsdom";

function parseDimensionsNGA(doc) {
  //TODO
  let h3 = Array.from(doc.querySelectorAll("h3.f-text--cta-l"))
    .find(el => el.textContent.trim() === "Dimensions");

  let cmValues = [];
  if (h3) {
    let pTag = h3.nextElementSibling;
    let cmText = pTag.textContent;

    // Match all numbers immediately followed by "cm"
    let cmMatches = cmText.match(/(\d+(\.\d+)?)\s*cm/g);

    // Remove "cm" and trim
    let cmNumbers = cmMatches.map(m => parseFloat(m));

    console.log(cmNumbers);
    return 0;
  }
}

function getDimensionTextNGA(doc) {
  let h3 = Array.from(doc.querySelectorAll("h3.f-text--cta-l"))
    .find(el => el.textContent.trim() === "Dimensions");

  let cmValues = [];
  if (h3) {
    let pTag = h3.nextElementSibling;
    return pTag.textContent;
  }
}

function writeToDB(
  title,
  artist_name,
  artist_country,
  artist_year,
  year,
  description,
  page_url,
  filename,
  overall_width,
  overall_height,
  framed_width,
  framed_height
) {
  let stmt = db.prepare(`
  INSERT INTO images (
    title,
    artist_name,
    artist_country,
    artist_year,
    year,
    description,
    page_url,
    filename,
    overall_width,
    overall_height,
    framed_width,
    framed_height
  ) VALUES (
    @title,
    @artist_name,
    @artist_country,
    @artist_year,
    @year,
    @description,
    @page_url,
    @filename,
    @overall_width,
    @overall_height,
    @framed_width,
    @framed_height
  )
`);

  stmt.run({
    title: title,
    artist_name: artist_name,
    artist_country: artist_country,
    artist_year: artist_year,
    year: year,
    description: description,
    page_url: page_url,
    filename: filename,
    overall_width: overall_width,
    overall_height: overall_height,
    framed_width: framed_width,
    framed_height: framed_height
  })
}

export function parseNGA(url, html) {
  let dom = new JSDOM(html);
  let doc = dom.window.document;

  //Painting metadata tag <script type="application/ld+json"></script>
  let scriptTag = doc.querySelector('script[type="application/ld+json"]');
  let match = scriptTag ? scriptTag.textContent : null;

  //Artist metadata tag <p class='f-text--text-m'></p>
  let artistTag = doc.querySelector('p.f-text--text-m');
  let match_artist = artistTag ? artistTag.textContent : null;

  //Description metadata tag  <div class="u-wysiwyg--small"><p></p></div>
  //let descriptionTag = doc.querySelector('div.u-wysiwyg--small > p');
  let descriptionTag = Array.from(doc.querySelectorAll('div.u-wysiwyg--small > p')).map(p => p.textContent.trim()).join("\n\n");
  let match_description = descriptionTag.split("\n\n").map(p => `<p>${p}</p>`).join("") || null;

  let data = null;
  let artist_data = null;

  //parse the match data into a json structure
  if (match) {
    try {
      data = JSON.parse(match);
    } catch (e) {
      console.error("Invalid JSON:", e);
    }
  }

  //split the artist string into Artist, Country, Year 
  if (match_artist) {
    try {
      artist_data = match_artist.split(",");
    } catch (e) {
      console.error("Invalid Artist:", e);
    }
  }

  let painting_data = data["@graph"][0]; //get first node

  // get the artist database entries
  let title = painting_data.name;
  let artist_name = painting_data["creator"][0].name;
  let artist_country = artist_data[1];
  let artist_year = artist_data[2];
  let year = painting_data.dateCreated;
  let description = match_description;
  let page_url = url;

  const basefilename = `${artist_name}__${title}`.toLowerCase();
  const filename =
    basefilename
      .normalize('NFKD')           // handles accented chars
      .replace(/[^\w\s-]/g, '')    // removes punctuation (including .)
      .trim()
      .replace(/\s+/g, '_')
    + '.jpg';
  let dimensions = getDimensionTextNGA(doc);

  let overall_width = 0;
  let overall_height = 0;
  let framed_width = 0;
  let framed_height = 0;

  //get image link from metadata
  let dlMatch = html.match(/data-download-url=["']([^"']+)["']/);
  let hrefMatch = html.match(/href="([^"]+)" download>/);
  let iiifMatch = doc.querySelector(".c-artwork-media-single__media-element-inner img").src.replace(/\/full\/!?[\d,]+\/0\//, "/full/full/0/");


  // Use whichever one worked
  let image_url =
    dlMatch?.[1] ||
    hrefMatch?.[1] ||
    iiifMatch ||
    null;

  //check if image exists in DB or not
  const exists = db.prepare(`
  SELECT 1
  FROM images
  WHERE title = ?
    AND artist_name = ?
    AND year = ?
  LIMIT 1
`).get(title, artist_name, year);

  if (exists) {
    return null;
  }
  else {
    // Write new entry to db.js
    writeToDB(
      title,
      artist_name,
      artist_country,
      artist_year,
      year,
      description,
      page_url,
      filename,
      overall_width,
      overall_height,
      framed_width,
      framed_height
    )
    return [image_url, filename]
  }
}

/* const stmt = db.prepare(`
  INSERT INTO images (
    title,
    artist_name,
    artist_country,
    artist_year,
    year,
    description,
    url,
    filename,
    overall_width,
    overall_height,
    framed_width,
    framed_height
  ) VALUES (
    @title,
    @artist_name,
    @artist_country,
    @artist_year,
    @year,
    @description,
    @url,
    @filename,
    @overall_width,
    @overall_height,
    @framed_width,
    @framed_height
  )
`);

stmt.run({
  title: "Starry Night",
  artist_name: "Vincent",
  artist_country: "Netherlands",
  artist_year: "1853–1890",
  year: 1889,
  description: "A famous painting",
  url: "https://example.com/starry-night.jpg",
  filename: "starry-night.jpg",
  overall_width: 73.7,
  overall_height: 92.1,
  framed_width: 80.0,
  framed_height: 100.0
}); */


/*
<script type="application/ld+json">{
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "CreativeWork",
            "@id": "https://id.nga.gov/11eede93-0fca-4b3a-b4d5-e07155b4bcc8",
            "headline": "Hunting in the Pontine Marshes",
            "name": "Hunting in the Pontine Marshes",
            "dateCreated": "1833",
            "creator": [
                {
                    "@type": "Person",
                    "@id": "https://id.nga.gov/5ed3f838-4dbf-46bb-842d-aa96d15df479",
                    "name": "Horace Vernet",
                    "url": "https://www.nga.gov/artists/3284-horace-vernet",
                    "birthDate": "1789",
                    "deathDate": "1863"
                }
            ]
        }
    ]
}</script>
 */

//   <p class='f-text--text-m'>Artist, French, 1789 - 1863</p>



//<div class="u-wysiwyg--small">
//                <p>How do portraits influence the way we see historic figures? David shows Napoleon Bonaparte working tirelessly for the people of France. The clock reads 4:13, the early morning. The candles are almost extinguished. The emperor’s hair is disheveled, his stocking rumpled. He has spent the night drafting the Napoleonic Code, France’s first civil law code. David’s portrait creates a powerful myth of the leader, but it’s not the full story. Napoleon was a military genius whose code became the model of modern legal systems worldwide, but he also left millions dead in his quest to conquer Europe. He reestablished slavery in France’s colonies and stole art from around the globe. His complex legacy is still the subject of fierce debate.</p>
//
//            </div>