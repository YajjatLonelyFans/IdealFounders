/**
 * Matchmaking Algorithm — Weighted Scoring (out of 100)
 *
 * 40% — Locality (state → city → locality)
 * 20% — Education (degree + year of passing)
 *  5% — Expertise cross-match
 * 20% — Skills cross-match (5% per matched skill, capped at 20)
 * 10% — Suitability / StartingFrom compatibility
 *  5% — Bio completeness
 */

const normalizeStr = (s) => (s || '').trim().toLowerCase();

// 40 points max
const calcLocalityScore = (userA, userB) => {
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

// 20 points max
const calcEducationScore = (userA, userB) => {
    const a = userA.education || {};
    const b = userB.education || {};

    // Skip scoring if either user has N/A education
    if (normalizeStr(a.degree) === 'n/a' || normalizeStr(b.degree) === 'n/a') {
        return 0;
    }

    let score = 0;
    if (normalizeStr(a.degree) === normalizeStr(b.degree)) {
        score += 10;
    }
    if (normalizeStr(a.yearOfPassing) === normalizeStr(b.yearOfPassing)) {
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

    // StartingFrom ↔ Suitability compatibility
    // own_idea pairs well with cofounder_looking
    // join_idea pairs well with cofounder_with_idea
    // either pairs with anything

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
