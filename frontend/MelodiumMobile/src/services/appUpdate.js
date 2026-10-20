import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { compareParsedVersions, parseVersion } from './versionModel';

const APP_ID = 'com.melodium.mobile';
const RELEASES_ENDPOINT = 'https://api.github.com/repos/micardosofph/Melodium/releases?per_page=10';
const DISMISSED_RELEASE_KEY = '@melodium/dismissed-update-release';
const REQUEST_TIMEOUT_MS = 6000;

function findApkAsset(release) {
    return release.assets?.find((asset) => asset.state === 'uploaded' && asset.name?.toLowerCase().endsWith('.apk'));
}

function selectLatestAppRelease(releases) {
    return releases
        .filter((release) => !release.draft)
        .map((release) => ({
            release,
            apk: findApkAsset(release),
            parsedVersion: parseVersion(release.tag_name),
        }))
        .filter((candidate) => candidate.apk && candidate.parsedVersion)
        .sort((left, right) => compareParsedVersions(right.parsedVersion, left.parsedVersion))[0] || null;
}

export async function checkForAvailableUpdate() {
    if (Application.applicationId !== APP_ID) return null;

    const installedVersion = Application.nativeApplicationVersion;
    const parsedInstalledVersion = parseVersion(installedVersion);
    if (!parsedInstalledVersion) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(RELEASES_ENDPOINT, {
            headers: {
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
            },
            signal: controller.signal,
        });
        if (!response.ok) return null;

        const releases = await response.json();
        if (!Array.isArray(releases)) return null;

        const latest = selectLatestAppRelease(releases);
        if (!latest || compareParsedVersions(latest.parsedVersion, parsedInstalledVersion) <= 0) return null;

        const dismissedRelease = await AsyncStorage.getItem(DISMISSED_RELEASE_KEY);
        if (dismissedRelease === latest.release.tag_name) return null;

        return {
            tagName: latest.release.tag_name,
            version: latest.release.tag_name.replace(/^v/i, ''),
            installedVersion,
            updateUrl: latest.apk.browser_download_url,
        };
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

export async function dismissUpdate(tagName) {
    if (!tagName) return;
    await AsyncStorage.setItem(DISMISSED_RELEASE_KEY, tagName);
}
