import semver from 'semver';
import fs from 'fs-extra';
import { markdownTable } from 'markdown-table';
import { marked } from 'marked';
import open from 'open';

const config = fs.readJsonSync('./config.json');

/**
* @typedef {Object} ModInfo
* @property {string} title - The title of the mod.
* @property {Array.<string>} versions - An array of game versions that this mod supports.
*/
class ModInfo {
    constructor(title, versions, versionBooleans = []) {
        this.title = title;
        this.versions = versions;
        this.versionBooleans = versionBooleans;
    }
}

(async () => {
    const acceptableGameVersions = await getAcceptableGameVersions();
    const modInfos = await Promise.all(config.modrinthModIDs.map(id => getModInfo(id)));

    await compileVersionBooleans(acceptableGameVersions, modInfos);
    buildCompatibleTable(acceptableGameVersions, modInfos);
    open('./output.html');
})();

async function fetchJSON(url) {
    return (await fetch(url)).json();
}
async function getAcceptableGameVersions() {
    const response = await fetchJSON(`${config.modrinthApiUrl}/tag/game_version`);
    const acceptableGameVersions = response
        .filter(element =>
            element.version_type === 'release'
            // && semver.valid(element.version)
            && semver.satisfies(semver.coerce(element.version).version, `>=${semver.coerce(config.minimumVersion).version}`)
        )
        .map(element => semver.coerce(element.version).version);
    return semver.sort(acceptableGameVersions);
}

async function getModInfo(id) {
    const response = await fetchJSON(`${config.modrinthApiUrl}/project/${id}`);
    console.log(`Fetched mod info for ${response.title}`);
    return new ModInfo(response.title, response.game_versions.map(version => semver.coerce(version).version));
}

async function compileVersionBooleans(acceptableGameVersions, modInfos) {
    modInfos.forEach(modInfo => {
        modInfo.versionBooleans = acceptableGameVersions.map(version => modInfo.versions.includes(version));
    });
}

function buildCompatibleTable(acceptableGameVersions, modInfos = []) {
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