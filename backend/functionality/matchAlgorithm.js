/**
 * Matchmaking Algorithm — Weighted Scoring (out of 100)
 *
 * Status-aware matching:
 * - Both graduated:  locality = 40, education = 0
 * - Both pursuing:   education = 40 (college 20 + degree 10 + year 10), locality = 0
 * - Cross-status:    locality = 0, education = 0
 *
 * Universal scores (always applied):
 *  5% — Expertise cross-match
 * 20% — Skills cross-match (5% per matched skill, capped at 20)
 * 10% — Suitability / StartingFrom compatibility
 *  5% — Bio completeness
 */

const normalizeStr = (s) => (s || '').trim().toLowerCase();

// 40 points max — only if both users are graduated
const calcLocalityScore = (userA, userB) => {
    // Only score locality when both users are graduates
    if (userA.graduateStatus !== 'graduated' || userB.graduateStatus !== 'graduated') {
        return 0;
    }

    const a = userA.location || {};
    const b = userB.location || {};

    if (normalizeStr(a.locality) === normalizeStr(b.locality) &&
        normalizeStr(a.city) === normalizeStr(b.city) &&
        normalizeStr(a.state) === normalizeStr(b.state)) {
        return 40;
    }
    if (normalizeStr(a.city) === normalizeStr(b.city) &&
        normalizeStr(a.state) === normalizeStr(b.state)) {
        return 25;
    }
    if (normalizeStr(a.state) === normalizeStr(b.state)) {
        return 10;
    }
    return 0;
};

// 40 points max — only if both users are pursuing
const calcEducationScore = (userA, userB) => {
    // Only score education when both users are pursuing
    if (userA.graduateStatus !== 'pursuing' || userB.graduateStatus !== 'pursuing') {
        return 0;
    }

    const a = userA.education || {};
    const b = userB.education || {};

    let score = 0;

    // College name match (20 pts)
    const collegeA = normalizeStr(a.collegeName);
    const collegeB = normalizeStr(b.collegeName);
    if (collegeA && collegeB && collegeA !== 'n/a' && collegeB !== 'n/a' && collegeA === collegeB) {
        score += 20;
    }

    // Degree match (10 pts)
    const degreeA = normalizeStr(a.degree);
    const degreeB = normalizeStr(b.degree);
    if (degreeA && degreeB && degreeA !== 'n/a' && degreeB !== 'n/a' && degreeA === degreeB) {
        score += 10;
    }

    // Year of passing match (10 pts)
    const yearA = normalizeStr(a.yearOfPassing);
    const yearB = normalizeStr(b.yearOfPassing);
    if (yearA && yearB && yearA !== 'n/a' && yearB !== 'n/a' && yearA === yearB) {
        score += 10;
    }

    return score;
};

// 5 points max
const calcExpertiseScore = (userA, userB) => {
    let score = 0;
    // A's expertise matches what B is looking for
    if (normalizeStr(userA.expertise) === normalizeStr(userB.expertiseLookingFor)) {
        score += 2.5;
    }
    // B's expertise matches what A is looking for
    if (normalizeStr(userB.expertise) === normalizeStr(userA.expertiseLookingFor)) {
        score += 2.5;
    }
    return score;
};

// 20 points max (5 per matched skill, capped)
const calcSkillsScore = (userA, userB) => {
    const aSkills = (userA.skills || []).map(normalizeStr);
    const bSkills = (userB.skills || []).map(normalizeStr);
    const aLooking = (userA.skillsLookingFor || []).map(normalizeStr);
    const bLooking = (userB.skillsLookingFor || []).map(normalizeStr);

    let matchCount = 0;

    // A's skills that B is looking for
    aSkills.forEach((skill) => {
        if (bLooking.includes(skill)) matchCount++;
    });

    // B's skills that A is looking for
    bSkills.forEach((skill) => {
        if (aLooking.includes(skill)) matchCount++;
    });

    return Math.min(matchCount * 5, 20);
};

// 10 points max
const calcSuitabilityScore = (userA, userB) => {
    let score = 0;

    const compatCheck = (startingFrom, suitability) => {
        if (startingFrom === 'either' || suitability === 'either') return true;
        if (startingFrom === 'own_idea' && suitability === 'cofounder_looking') return true;
        if (startingFrom === 'join_idea' && suitability === 'cofounder_with_idea') return true;
        return false;
    };

    // A's startingFrom matches B's suitability
    if (compatCheck(userA.startingFrom, userB.suitability)) {
        score += 5;
    }
    // B's startingFrom matches A's suitability
    if (compatCheck(userB.startingFrom, userA.suitability)) {
        score += 5;
    }

    return score;
};

// 5 points max
const calcBioScore = (user) => {
    const bio = (user.bio || '').trim();
    return bio.length >= 10 ? 5 : 0;
};

export const calculateMatchScore = (userA, userB) => {
    const locality = calcLocalityScore(userA, userB);
    const education = calcEducationScore(userA, userB);
    const expertise = calcExpertiseScore(userA, userB);
    const skills = calcSkillsScore(userA, userB);
    const suitability = calcSuitabilityScore(userA, userB);
    const bio = Math.min(calcBioScore(userA), calcBioScore(userB));

    return locality + education + expertise + skills + suitability + bio;
};
