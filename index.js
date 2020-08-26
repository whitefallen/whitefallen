require("dotenv").config();
require("isomorphic-unfetch");
const {promises: fs} = require("fs");
const path = require("path");

const clientId = process.env.client_id;
const clientSecret = process.env.client_secret;
const refreshToken = process.env.refresh_token;

async function main() {
    const readmeTemplate = (
        await fs.readFile(path.join(process.cwd(), "./README.template.md"))
    ).toString("utf-8");

    const { access_token } = await (
        await fetch(
            `https://accounts.spotify.com/api/token?grant_type=refresh_token&client_id=${clientId}&client_secret=${clientSecret}&refresh_token=${refreshToken}`,
            {
                headers: {
                    "content-type": "application/x-www-form-urlencoded ",
                },
                method: "POST",
            }
        )
    ).json();

    const currentlyPlayingJson = await (
        await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })
    ).json();

    console.log(currentlyPlayingJson);

    const track_name = currentlyPlayingJson.item.name;
    const track_artist = currentlyPlayingJson.item.artists[0].name;
    const track_image = currentlyPlayingJson.item.album.images[1].url;

    const readme = readmeTemplate
        .replace("{track_image}", track_image)
        .replace("{track_artist}", track_artist)
        .replace("{track_name}", track_name)

    await fs.writeFile("README.md", readme);
}

main();
