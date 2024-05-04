//! API documentation:
//* https://docs.modrinth.com/

import semver from 'semver';
import { ModInfo } from './ModInfo.js';
import fs from 'fs-extra';
import https from 'https';

async function getModInfos(log, apiURL, modSlugs = []) {
    return (await (await fetch(`${apiURL}/projects?ids=${JSON.stringify(modSlugs).replace('+', '%2B')}`)).json())
        .map(response => {
            log(`Fetched mod info from Modrinth for ${response.title}`);
            return new ModInfo(
                ModInfo.hosts.MODRINTH,
                response.title,
                response.id,
                response.slug,
                response.game_versions.map(version => semver.coerce(version).version),
            );
        });
}

async function downloadMods(log, apiURL, modInfos = [new ModInfo()], gameVersion, modLoaders = []) {
    await Promise.all(modInfos.map(modInfo => downloadMod(modInfo, 0)));
    log('All Modrinth mods downloaded.');

    async function downloadMod(modInfo = new ModInfo(), modLoaderIndex) {
        const modLoader = modLoaders[modLoaderIndex];
        const response = await (await fetch(`${apiURL}/project/${modInfo.id}/version?loaders=["${modLoader.toLowerCase()}"]&game_versions=["${gameVersion}"]`)).json();
        if (!response.length) {
            log(`No ${modLoader} version found for ${modInfo.title} on Modrinth.`);
            if (modLoaderIndex + 1 < modLoaders.length) { await downloadMod(modInfo, modLoaderIndex + 1); }
            return;
        }
        const modVersionName = response[0].name;
        const modFile = response[0].files[0];

        await new Promise((resolve, reject) => {
            log(`Downloading ${modLoader} ${modInfo.title} ${modVersionName} from Modrinth from ${modFile.url}`);
            https.get(modFile.url, response => {
                const fileStream = fs.createWriteStream(`./mods/${modFile.filename}`);
                response.pipe(fileStream);

                fileStream.on('finish', () => {
                    fileStream.close();
                    log(`Downloaded ${modInfo.title} ${modVersionName}: ${modFile.filename} from Modrinth.`);
                    resolve();
                });

                fileStream.on('error', err => {
                    fs.unlink(`./mods/${modFile.filename}`);
                    log(`Failed to download ${modInfo.title} ${modVersionName}: ${modFile.filename} from Modrinth.`);
                    reject(err);
                });
            });
        });
    }
}

export default { getModInfos, downloadMods };