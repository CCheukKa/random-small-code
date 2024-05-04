import semver from 'semver';
import fs from 'fs-extra';
import { markdownTable } from 'markdown-table';
import { marked } from 'marked';
import open from 'open';

import { timestampLog } from './library/TimestampLog.js';
import { ModInfo } from './library/ModInfo.js';
import ModrinthScraper from './library/ModrinthScraper.js';
import CurseforgeScraper from './library/CurseforgeScraper.js';

const config = fs.readJsonSync('./config/config.json');
const curseforgeApiKey = fs.readFileSync('./config/curseforgeApiKey.txt', 'utf-8');

(async () => {
    const acceptableGameVersions = await getAcceptableGameVersions();
    const modrinthModInfosPromise = config.modrinthModSlugs ? ModrinthScraper.getModInfos(timestampLog, config.modrinthApiUrl, config.modrinthModSlugs) : [];
    const curseforgeModInfosPromise = config.curseforgeModSlugs ? CurseforgeScraper.getModInfos(timestampLog, config.curseforgeApiUrl, curseforgeApiKey, config.curseforgeModSlugs) : [];
    const modInfos = (await Promise.all([modrinthModInfosPromise, curseforgeModInfosPromise,])).flat();
    const modrinthModInfos = await modrinthModInfosPromise;
    const curseforgeModInfos = await curseforgeModInfosPromise;

    config.modrinthModSlugs?.forEach(slug => {
        if (!modInfos.find(modInfo => modInfo.host === ModInfo.hosts.MODRINTH && modInfo.slug === slug)) {
            timestampLog(`Mod slug ${slug} not found on Modrinth.`);
        }
    });
    config.curseforgeModSlugs?.forEach(slug => {
        if (!modInfos.find(modInfo => modInfo.host === ModInfo.hosts.CURSEFORGE && modInfo.slug === slug)) {
            timestampLog(`Mod slug ${slug} not found on CurseForge.`);
        }
    });

    // ModrinthScraper.downloadMods(timestampLog, config.modrinthApiUrl, modrinthModInfos, "1.20.1", [ModInfo.modLoaders.QUILT, ModInfo.modLoaders.FABRIC]);
    // CurseforgeScraper.downloadMods(timestampLog, config.curseforgeApiUrl, curseforgeApiKey, curseforgeModInfos, "1.20.1", [ModInfo.modLoaders.QUILT, ModInfo.modLoaders.FABRIC]);

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