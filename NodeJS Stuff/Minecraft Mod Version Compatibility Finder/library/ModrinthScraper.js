//! API documentation:
//* https://docs.modrinth.com/

import semver from 'semver';
import { ModInfo } from './ModInfo.js';

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

export default { getModInfos };