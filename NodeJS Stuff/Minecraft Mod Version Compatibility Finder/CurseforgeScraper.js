import semver from 'semver';
import { ModInfo } from './ModInfo.js';

async function getModInfos(apiURL, apiKey, modIDs = []) {
    return await Promise.all(modIDs.map(id => getModInfo(id)));

    async function getModInfo(id) {
        /*
            Mod Loader IDs:
            4 = Fabric
            5 = Quilt
        */
        const acceptableModLoaders = [4, 5];

        const response = await (await fetch(`${apiURL}/mods/search?gameid=432&slug=${id}`, { headers: { 'Accept': 'application/json', "x-api-key": apiKey } })).json();
        const mod = response.data[0];
        console.log(`Fetched mod info from CurseForge for ${mod.name}`);
        return new ModInfo(
            "CurseForge",
            mod.name,
            [...new Set(
                mod.latestFilesIndexes
                    .filter(index => acceptableModLoaders.includes(index.modLoader))
                    .map(index => semver.coerce(index.gameVersion).version)
            )]);
    }
}

export default { getModInfos };