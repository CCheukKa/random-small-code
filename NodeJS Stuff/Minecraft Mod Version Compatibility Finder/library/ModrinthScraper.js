//! API documentation:
//* https://docs.modrinth.com/

import semver from 'semver';
import { ModInfo } from './ModInfo.js';

async function getModInfos(log, apiURL, modIDs = []) {
    return (await (await fetch(`${apiURL}/projects?ids=${JSON.stringify(modIDs)}`)).json())
        .map(response => {
            log(`Fetched mod info from Modrinth for ${response.title}`);
            return new ModInfo("Modrinth", response.title, response.game_versions.map(version => semver.coerce(version).version));
        });
}

export default { getModInfos };