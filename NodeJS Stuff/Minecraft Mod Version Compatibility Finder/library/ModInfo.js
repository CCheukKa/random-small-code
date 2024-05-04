export class ModInfo {

    static hosts = Object.freeze({
        MODRINTH: 'Modrinth',
        CURSEFORGE: 'CurseForge'
    });

    /**
    * @typedef {Object} ModInfo
    * @property {string} host - The host of the mod.0
    * @property {string} title - The title of the mod.
    * @property {string} id - The ID of the mod.
    * @property {string} slug - The slug of the mod.
    * @property {Array.<string>} versions - An array of game versions that this mod supports.
    * @property {Array.<boolean>} versionBooleans - An array of booleans that represent whether or not this mod supports each game version.
    */
    constructor(host, title, id, slug, versions) {
        this.host = host;
        this.title = title;
        this.id = id;
        this.slug = slug;
        this.versions = versions;
        this.versionBooleans = [];
    }
}