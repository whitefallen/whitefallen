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

    const recentlyPlayed = await (
        await fetch("https://api.spotify.com/v1/me/player/recently-played", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })
    ).json();

    console.log(recentlyPlayed);
    console.log("Last Played: " + recentlyPlayed.items[0].track.name);

    const track_name = recentlyPlayed.items[0].track.name;
    const track_artist = recentlyPlayed.items[0].track.artists[0].name;
    const track_image = recentlyPlayed.items[0].track.album.images[1].url;
    const track_link = recentlyPlayed.items[0].track.external_urls.spotify;

    const build_table_body = recentlyPlayed.items.map((item) => {
        return `<tr><td>${item.track.artists[0].name}</td><td>${item.track.name}</td><td><a href="${item.track.external_urls.spotify}">${item.track.external_urls.spotify}</a></td></tr>`
    });
    const readme = readmeTemplate
        .replace("{track_image}", track_image)
        .replace("{track_artist}", track_artist)
        .replace("{track_alt}", track_name)
        .replace("{track_name}", track_name)
        .replace("{track_link}", track_link)
        .replace("{track_list}", build_table_body.join(""))

    await fs.writeFile("README.md", readme);
}

main();
