import express from "express";
import fs from "fs";
import path from "path";
import db from "./js/db.js";
import puppeteer from "puppeteer";
import { parseNGA } from "./parser.js"


const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(".")); // serve index.html, parser.js


async function downloadImage(url, filename) {
  try {
    let response = await fetch(url);
    let buffer = await response.arrayBuffer();
    let filePath = path.join("images", filename || "image.jpg");

    fs.writeFileSync(filePath, Buffer.from(buffer));
  } catch (err) {
    console.error(err);
  }
}

//LOAD IMAGES FROM DB ENDPOINT---------------------------------------------------------
app.get("/images", (req, res) => {
  let images = db.prepare("SELECT * FROM images").all();
  res.json(images);
});

//FETCH NGA ENDPOINT---------------------------------------------------------
app.post("/fetchNGA", async (req, res) => {
  let { url, html } = req.body;
  if (!url) return res.status(400).send("Missing URL");

  try {
    let imageUrlandFilename = parseNGA(url, html);
    if (imageUrlandFilename == null){ //already in db
      res.status(409).send("Image already exists in database");
    }
    else{
      let image_url = imageUrlandFilename[0];
      let filename = imageUrlandFilename[1];
      downloadImage(image_url, filename);
      res.sendStatus(200);
    }

  } catch (err) {
    console.error(err);
    res.status(500).send("Fetch failed");
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));