export default class GalleryImage {
    constructor(id,
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
        framed_height) {

        this.id = id;
        this.title = title;
        this.artist_name = artist_name;
        this.artist_country = artist_country;
        this.artist_year = artist_year;
        this.year = year;
        this.description = description;
        this.url = url;
        this.filename = filename;
        this.overall_width = overall_width;
        this.overall_height = overall_height;
        this.framed_width = framed_width;
        this.framed_height = framed_height;

    }

}