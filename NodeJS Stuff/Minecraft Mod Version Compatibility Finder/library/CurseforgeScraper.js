//! API documentation:
//* https://docs.curseforge.com/

import semver from 'semver';
import { ModInfo } from './ModInfo.js';

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
            mod.name,
            mod.id,
            mod.slug,
            [...new Set(
                mod.latestFilesIndexes
                    .filter(index => acceptableModLoaders.includes(index.modLoader))
                    .map(index => semver.coerce(index.gameVersion).version)
            )],
        );
    }
}

export default { getModInfos };