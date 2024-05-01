import semver from 'semver';
import { ModInfo } from './ModInfo.js';

async function getModInfos(apiURL, modIDs = []) {
    return await Promise.all(modIDs.map(id => getModInfo(id)));

    async function getModInfo(id) {
        const response = await (await fetch(`${apiURL}/project/${id}`)).json();
        console.log(`Fetched mod info from Modrinth for ${response.title}`);
        return new ModInfo("Modrinth", response.title, response.game_versions.map(version => semver.coerce(version).version));
    }
}

export default { getModInfos };