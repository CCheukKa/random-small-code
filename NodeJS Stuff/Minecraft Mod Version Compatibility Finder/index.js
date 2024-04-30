import semver from 'semver';
import fs from 'fs-extra';
import { markdownTable } from 'markdown-table';
import { marked } from 'marked';
import open from 'open';

import { ModInfo } from './ModInfo.js';
import ModrinthScraper from './ModrinthScraper.js';
import CurseforgeScraper from './CurseforgeScraper.js';

const config = fs.readJsonSync('./config.json');

(async () => {
    const acceptableGameVersions = await getAcceptableGameVersions();
    const modInfos = (await Promise.all([
        ModrinthScraper.getModInfos(config.modrinthApiUrl, config.modrinthModIDs),
        // CurseforgeScraper.getModInfos(config.modrinthApiUrl, config.modrinthModIDs)
    ])).flat();

    await compileVersionBooleans(acceptableGameVersions, modInfos);
    buildCompatibleTable(acceptableGameVersions, modInfos);
    open('./output.html');
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

function buildCompatibleTable(acceptableGameVersions, modInfos = [new ModInfo()]) {
    modInfos.sort((a, b) => a.title.localeCompare(b.title));
    fs.writeJsonSync('./output.json', { acceptableGameVersions, modInfos });
    fs.writeFileSync('./output.md', markdownTable(
        [
            ['Mod', ...acceptableGameVersions],
            ...modInfos.map(modInfo => [modInfo.title, ...modInfo.versionBooleans.map(boolean => boolean ? '✅' : '❌')])
        ],
        { align: ['l', ...Array(acceptableGameVersions.length).fill('c')] }
    ));
    fs.writeFileSync('./output.html',
        fs.readFileSync('./reportWrapper.html', 'utf8')
            .replace('<!-- REPORT -->', marked(fs.readFileSync('./output.md', 'utf8')))
    );
}