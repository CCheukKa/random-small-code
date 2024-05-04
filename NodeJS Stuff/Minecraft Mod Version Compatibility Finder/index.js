import semver from 'semver';
import fs from 'fs-extra';
import { markdownTable } from 'markdown-table';
import { marked } from 'marked';
import open from 'open';

import { ModInfo } from './library/ModInfo.js';
import ModrinthScraper from './library/ModrinthScraper.js';
import CurseforgeScraper from './library/CurseforgeScraper.js';

const config = fs.readJsonSync('./config/config.json');

(async () => {
    const acceptableGameVersions = await getAcceptableGameVersions();
    const modInfos = (await Promise.all([
        config.modrinthModIDs ? ModrinthScraper.getModInfos(config.modrinthApiUrl, config.modrinthModIDs) : [],
        config.curseforgeModIDs ? CurseforgeScraper.getModInfos(config.curseforgeApiUrl, fs.readFileSync('./config/curseforgeApiKey.txt', 'utf-8'), config.curseforgeModIDs) : [],
    ])).flat();

    await compileVersionBooleans(acceptableGameVersions, modInfos);
    buildCompatibilityTable(acceptableGameVersions, modInfos);
    open('./report.html');
})();

async function getAcceptableGameVersions() {
    // Versions are fetched from Modrinth because CurseForge API is a mess

    const response = await (await fetch(`${config.modrinthApiUrl}/tag/game_version`)).json();
    const acceptableGameVersions = response
        .filter(element =>
            element.version_type === 'release'
            // && semver.valid(element.version)
            && semver.satisfies(semver.coerce(element.version).version, `>=${semver.coerce(config.minimumVersion).version}`)
        )
        .map(element => semver.coerce(element.version).version);
    return semver.sort(acceptableGameVersions);
}

async function compileVersionBooleans(acceptableGameVersions, modInfos = [new ModInfo()]) {
    modInfos.forEach(modInfo => {
        modInfo.versionBooleans = acceptableGameVersions.map(version => modInfo.versions.includes(version));
    });
}

function buildCompatibilityTable(acceptableGameVersions, modInfos = [new ModInfo()]) {
    fs.writeJsonSync('./report.json', { acceptableGameVersions, modInfos });
    fs.writeFileSync('./report.md', markdownTable(
        [
            ['Host', 'Mod', ...acceptableGameVersions],
            ...modInfos.map(modInfo => [modInfo.host, modInfo.title, ...modInfo.versionBooleans.map(boolean => boolean ? '✅' : '❌')])
        ],
        { align: ['l', 'l', ...Array(acceptableGameVersions.length).fill('c')] }
    ));
    fs.writeFileSync('./report.html',
        fs.readFileSync('./reportWrapper.html', 'utf8')
            .replace('<!-- REPORT -->', marked(fs.readFileSync('./report.md', 'utf8')))
    );
}