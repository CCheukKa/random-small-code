//! API documentation:
//* https://docs.curseforge.com/

import semver from 'semver';
import { ModInfo } from './ModInfo.js';
import fs from 'fs-extra';
import https from 'https';

async function getModInfos(log, apiURL, apiKey, modSlugs = []) {
    return (await Promise.all(modSlugs.map(slug => getModInfo(slug)))).filter(modInfo => modInfo !== undefined);

    async function getModInfo(slug) {
        /*
            Mod Loader IDs:
            4 = Fabric
            5 = Quilt
        */
        const acceptableModLoaders = [4, 5];

        const response = await (await fetch(`${apiURL}/mods/search?gameid=432&slug=${slug}`, { headers: { 'Accept': 'application/json', "x-api-key": apiKey } })).json();
        const mod = response.data[0];
        if (!mod) { return; }
        log(`Fetched mod info from CurseForge for ${mod.name}`);
        return new ModInfo(
            ModInfo.hosts.CURSEFORGE,
            "https://www.curseforge.com/minecraft",
            mod.name,
            mod.id,
            mod.slug,
            mod.links.websiteUrl,
            [...new Set(
                mod.latestFilesIndexes
                    .filter(index => acceptableModLoaders.includes(index.modLoader))
                    .map(index => semver.coerce(index.gameVersion).version)
            )],
        );
    }
}

async function downloadMods(log, apiURL, apiKey, modInfos = [new ModInfo()], gameVersion, modLoaders = []) {
    await Promise.all(modInfos.map(modInfo => downloadMod(modInfo, 0)));
    log('All CurseForge mods downloaded.');

    async function downloadMod(modInfo = new ModInfo(), modLoaderIndex) {
        const modLoader = modLoaders[modLoaderIndex];
        const response = await (await fetch(`${apiURL}/mods/${modInfo.id}/files?gameVersion=${gameVersion}&modLoaderType=${modLoader}`, { headers: { 'Accept': 'application/json', "x-api-key": apiKey } })).json();
        if (!response.data.length) {
            log(`No ${modLoader} version found for ${modInfo.title} on CurseForge.`);
            if (modLoaderIndex + 1 < modLoaders.length) { await downloadMod(modInfo, modLoaderIndex + 1); }
            return;
        }
        const modFile = response.data[0];

        await new Promise((resolve, reject) => {
            log(`Downloading ${modLoader} ${modInfo.title} ${modFile.displayName} from CurseForge from ${modFile.downloadUrl}`);
            https.get(modFile.downloadUrl, response => {
                const fileStream = fs.createWriteStream(`./mods/${modFile.fileName}`);
                response.pipe(fileStream);

                fileStream.on('finish', () => {
                    fileStream.close();
                    log(`Downloaded ${modInfo.title} ${modFile.displayName}: ${modFile.fileName} from CurseForge.`);
                    resolve();
                });

                fileStream.on('error', err => {
                    fs.unlink(`./mods/${modFile.filename}`);
                    log(`Failed to download ${modInfo.title} ${modFile.displayName}: ${modFile.fileName} from CurseForge.`);
                    reject(err);
                });
            });
        });
    }
}

export default { getModInfos, downloadMods };