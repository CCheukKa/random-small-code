export class ModInfo {

    /**
    * @typedef {Object} ModInfo
    * @property {string} title - The title of the mod.
    * @property {Array.<string>} versions - An array of game versions that this mod supports.
    */
    constructor(host, title, versions, versionBooleans = []) {
        this.host = host;
        this.title = title;
        this.versions = versions;
        this.versionBooleans = versionBooleans;
    }
}