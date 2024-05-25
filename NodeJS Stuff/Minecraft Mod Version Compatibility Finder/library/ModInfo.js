export class ModInfo {

    static hosts = Object.freeze({
        NULL: 'Null',
        MODRINTH: 'Modrinth',
        CURSEFORGE: 'CurseForge'
    });

    static modLoaders = Object.freeze({
        NULL: 'Null',
        QUILT: 'Quilt',
        FABRIC: 'Fabric',
        FORGE: 'Forge'
    });

    /**
    * @typedef {Object} ModInfo
    * @property {string} host - The host of the mod.0
    * @property {string} hostUrl - The URL of the host of the mod.
    * @property {string} title - The title of the mod.
    * @property {string} id - The ID of the mod.
    * @property {string} slug - The slug of the mod.
    * @property {string} url - The URL of the mod.
    * @property {Array.<string>} versions - An array of game versions that this mod supports.
    * @property {Array.<boolean>} versionBooleans - An array of booleans that represent whether or not this mod supports each game version.
    */
    constructor(host, hostUrl, title, id, slug, url, versions) {
        this.host = host;
        this.hostUrl = hostUrl;
        this.title = title;
        this.id = id;
        this.slug = slug;
        this.url = url;
        this.versions = versions;
        this.versionBooleans = [];
    }
}