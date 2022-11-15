import semver from 'semver';
import ProjectDetails from '../models/ProjectDetails';

const RESOURCE = 'doc';

/**
 * Returns the docat configuration JSON (for example a custom header)
 * @returns The config JSON
 */
async function getConfig(): Promise<{}> {
    try {
        const resp = await fetch(`/config.json`)
        return JSON.parse(await resp.json());
    } catch {
        return {};
    }
};

/**
 * Returns a list of all projects
 * @returns {string[]} - list of project names 
 */
async function get(): Promise<string[]> {
    try {
        const resp = await fetch(`/api/projects`);
        const projects = await resp.json();
        return projects.projects;
    }
    catch {
        return [];
    }
};

/**
 * Returns the logo URL of a given project
 * @param {string} projectName Name of the project
 */
function getProjectLogoURL(projectName: string): string {
    return `/${RESOURCE}/${projectName}/logo`;
};

/**
 * Returns the project documentation URL
 * @param {string} projectName Name of the project
 * @param {string} version Version name
 * @param {string?} docsPath Path to the documentation page
 */
function getProjectDocsURL(projectName: string, version: string, docsPath: string | undefined): string {
    return `/${RESOURCE}/${projectName}/${version}/${docsPath || ''}`;
};

/**
 * Returns the docs path only without the prefix, project and version
 * @param {string} projectName Name of the project
 * @param {string} version Version name
 * @param {string} fullDocsPath Full path to the docs including prefix, project and version
 */
function getDocsPath(projectName: string, version: string, fullDocsPath: string): string {
    const match = decodeURIComponent(fullDocsPath).match(new RegExp(
        String.raw`(.*)/${RESOURCE}/${projectName}/${version}/(.*)`
    ));

    if (match && match.length > 2) {
        return match[2] || "";
    }

    return fullDocsPath;
};

/**
 * Returns information about the Project
 * this includes mainly the existing versions
 * @param {string} projectName Name of the project
 */
async function getVersions(projectName: string): Promise<ProjectDetails[]> {
    try {
        const resp = await fetch(`/api/projects/${projectName}`);
        const project = await resp.json();
        return project.versions;
    } catch {
        return [];
    }
};

/**
 * Uploads new project documentation
 * @param {string} projectName Name of the project
 * @param {string} version Name of the version
 * @param {FormData} body Data to upload
 */
async function upload(projectName: string, version: string, body: FormData) {
    const resp = await fetch(`/api/${projectName}/${version}`,
        {
            method: 'POST',
            body
        }
    )

    const json = await resp.json()

    if (!resp.ok) {
        throw new Error(json.message)
    }

    return json
};

/**
 * Claim the project token
 * @param {string} projectName Name of the project
 */
async function claim(projectName: string) {
    const resp = await fetch(`/api/${projectName}/claim`);
    const json = await resp.json();

    if (!resp.ok) {
        throw new Error(json.message)
    }

    return json;
};

/**
 * Deletes existing project documentation
 * @param {string} projectName Name of the project
 * @param {string} version Name of the version
 * @param {string} token Token to authenticate
 */
async function deleteDoc(projectName: string, version: string, token: string) {
    const headers = { "Docat-Api-Key": token };
    const resp = await fetch(`/api/${projectName}/${version}`,
        {
            method: 'DELETE',
            headers: headers
        }
    );

    const json = await resp.json();

    if (!resp.ok) {
        throw new Error(json.message)
    }

    return json;
}

/**
 * Compare two versions according to semantic version (semver library)
 * Will always consider the version latest as higher version
 *
 * @param {Object} versionA first version to compare
 * @param {string} versionA.name version name
 * @param {string[] | undefined} versionA.tags optional tags for this vertion
 *
 * @param {Object} versionB second version to compare
 * @param {string} versionB.name version name
 * @param {string[] | undefined} versionB.tags optional tags for this vertion
 */
function compareVersions(versionA: { name: string, tags: string[] | undefined }, versionB: { name: string, tags: string[] | undefined }): number {
    if ((versionA.tags || []).includes('latest')) {
        return 1;
    }

    if ((versionB.tags || []).includes('latest')) {
        return -1;
    }

    const semverA = semver.coerce(versionA.name);
    const semverB = semver.coerce(versionB.name);

    if (!semverA || !semverB) {
        return versionA.name.localeCompare(versionB.name);
    }

    return semver.compare(semverA, semverB);
};

/**
* Returns boolean indicating if the project name is part of the favorites.
* @param {string} projectName name of the project
* @returns {boolean} - true is project is favorite
*/
function isFavorite(projectName: string): boolean {
    return localStorage.getItem(projectName) === "favorite";
};

/**
   * Sets favorite preference on project
   * @param {string} projectName
   * @param {boolean} shouldBeFavorite
   */
function setFavorite(projectName: string, shouldBeFavorite: boolean): void {
    if (shouldBeFavorite) {
        localStorage.setItem(projectName, "favorite");
    } else {
        localStorage.removeItem(projectName);
    }
};

const exp = {
    getConfig,
    get,
    getProjectLogoURL,
    getProjectDocsURL,
    getDocsPath,
    getVersions,
    upload,
    claim,
    deleteDoc,
    compareVersions,
    isFavorite,
    setFavorite
}

export default exp;