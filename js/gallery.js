import GalleryImage from "./GalleryImage.js";

const imagearray = [];
const headerEl = document.getElementById("header");
const galleryEl = document.getElementById("gallery");
const viewerEl = document.getElementById("viewer");
const infoboxEl = document.getElementById("infobox");
const sidebarEl = document.getElementById("sidebar");
const importEl = document.getElementById("import");

async function loadGallery() {

  //Dpwnload painting DB
  const response = await fetch("/images");
  const imagedata = await response.json();
  imagedata.forEach((imagedata, index) => {
    const im = new GalleryImage(
      imagedata.id,
      imagedata.title,
      imagedata.artist_name,
      imagedata.artist_country,
      imagedata.artist_year,
      imagedata.year,
      imagedata.description,
      imagedata.page_url,
      imagedata.filename,
      imagedata.overall_width,
      imagedata.overall_height,
      imagedata.framed_width,
      imagedata.framed_height)

    //add to image list
    imagearray.push(im);

  });
}

function drawGallery() {
  imagearray.forEach((image, index) => {
    //add html elements
    const container = document.createElement("div");
    const caption = document.createElement("div");
    const img = document.createElement("img");

    //modify page html
    container.classList.add('smallimgcontainer');
    caption.classList.add('caption');
    img.classList.add('smallimg');
    caption.innerHTML = `
      <h1>${image.title.toUpperCase()}</h1>
      <h2>${image.artist_name}, ${image.year}</h2>
      `;

    img.src = "images/" + image.filename;
    img.alt = image.title;

    //add click event
    img.addEventListener("click", () => {
      viewImage(image.id);
      console.log(image.id);
    });

    container.appendChild(caption);
    container.appendChild(img);
    galleryEl.appendChild(container);
  })
}

async function refreshGallery() {
  imagearray.length = 0;
  galleryEl.innerHTML = "";
  await loadGallery();
  drawGallery();
}

function viewImage(id) {
  headerEl.classList.add('hidden');
  sidebarEl.classList.add('hidden');
  galleryEl.classList.add('hidden');
  viewerEl.classList.remove('hidden');
  infoboxEl.classList.remove('hidden');


  const i = id - 1; //db id is indexed starting at 1 <rolleyes>
  const imgcontainerEl = document.createElement("div");
  imgcontainerEl.id = "imgcontainer";
  const imgEl = document.createElement("img");
  const im = imagearray[i];

  imgEl.src = "images/" + im.filename;
  imgcontainerEl.classList.add('imagecontainer');

  imgcontainerEl.appendChild(imgEl);
  viewerEl.appendChild(imgcontainerEl);

  //format infobox
  infoboxEl.innerHTML = `
    <h1>${im.artist_name}</h1>
    ${im.artist_country ?? ""}${im.artist_country && im.artist_year ? ", " : ""}${im.artist_year ?? ""}<br><br>
    <i>${im.title},</i> ${im.year}<br>

    <p>${im.description}</p>
    `;
  console.log(im.artist_country);
  infoboxEl.innerHTML = content.replace(/\n/g, "<br>");
}

async function fetchImageNGA() {
  console.log("trying pull");
  let url = document.getElementById("urlInput").value;
  let html = document.getElementById("htmlInput").value;
  console.log(url);

  if (!url) return alert("Enter a URL!");
  if (!html) return alert("Enter the HTML!");

  //use the scrape endpoint
  let res = await fetch("/fetchNGA", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url, html })
  });

  let message = await res.text();

  if (!res.ok) {
    alert(message);
    return;
  }

  alert("Successfully fetched image");
  document.getElementById("import").classList.add("hidden")
  document.getElementById("urlInput").value = "";
  document.getElementById("htmlInput").value = "";
  await refreshGallery();
}

function viewGallery() {
  //reset viewer and infobox content
  document.getElementById('imgcontainer').remove();
  infoboxEl.innerHTML = "";

  headerEl.classList.remove('hidden');
  galleryEl.classList.remove('hidden');
  viewerEl.classList.add('hidden');
}

function viewImport() {
  importEl.classList.remove('hidden');
}

function hideSidebar() {
  sidebarEl.classList.add("hidden");
}

function toggleSidebar() {
  sidebarEl.classList.toggle("hidden");
}



function init() {

  //click handler
  document.addEventListener("click", (e) => {
    if (e.target.matches("[data-action='viewgallery']")) {
      viewGallery();
    }
    if (e.target.matches("[data-action='viewimport']")) {
      viewImport();
    }
    if (e.target.matches("[data-action='togglesidebar']")) {
      toggleSidebar();
    }
    if (e.target.matches("[data-action='fetchimage']")) {
      scrape();
    }
    if (e.target.matches("[data-action='import_nga']")) {
      document.getElementById("import_NGA").classList.remove("hidden")
      document.getElementById("import_blank").classList.add("hidden")
    }
    if (e.target.matches("[data-action='fetch_nga']")) {
      fetchImageNGA();
    }

  });


  sidebarEl.addEventListener("click", (e) => {
    const link = e.target.closest("a"); // or "li" if you're using those
    if (!link) return;

    hideSidebar();
  });

  //close buttons
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-close]");
    if (!btn) return;

    const selector = btn.dataset.close;// || ".panel";
    const target = btn.closest(selector);

    if (target) target.classList.add("hidden"); // or hide
  });
}

async function main() {
  await loadGallery();
  drawGallery();
}

init();
main();
