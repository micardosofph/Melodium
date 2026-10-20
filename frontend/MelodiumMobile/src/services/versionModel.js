const VERSION_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

export function parseVersion(value) {
    const match = String(value || '').trim().match(VERSION_PATTERN);
    if (!match) return null;

    return {
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3]),
        prerelease: match[4] ? match[4].split('.') : [],
    };
}

function comparePrereleaseIdentifier(left, right) {
    const leftIsNumber = /^\d+$/.test(left);
    const rightIsNumber = /^\d+$/.test(right);

    if (leftIsNumber && rightIsNumber) return Number(left) - Number(right);
    if (leftIsNumber) return -1;
    if (rightIsNumber) return 1;
    if (left === right) return 0;
    return left < right ? -1 : 1;
}

export function compareParsedVersions(left, right) {
    for (const key of ['major', 'minor', 'patch']) {
        if (left[key] !== right[key]) return left[key] - right[key];
    }

    if (left.prerelease.length === 0 && right.prerelease.length === 0) return 0;
    if (left.prerelease.length === 0) return 1;
    if (right.prerelease.length === 0) return -1;

    const identifierCount = Math.max(left.prerelease.length, right.prerelease.length);
    for (let index = 0; index < identifierCount; index += 1) {
        if (left.prerelease[index] === undefined) return -1;
        if (right.prerelease[index] === undefined) return 1;

        const comparison = comparePrereleaseIdentifier(left.prerelease[index], right.prerelease[index]);
        if (comparison !== 0) return comparison;
    }

    return 0;
}

export function compareVersions(leftValue, rightValue) {
    const left = parseVersion(leftValue);
    const right = parseVersion(rightValue);
    if (!left || !right) return null;
    return compareParsedVersions(left, right);
}

export function isVersionNewer(candidate, installed) {
    const comparison = compareVersions(candidate, installed);
    return comparison !== null && comparison > 0;
}
