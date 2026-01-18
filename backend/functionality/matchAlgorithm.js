export const calculateMatchScore = (user, candidate) => {
    let score = 0;

    // +10 points per shared skill
    if (user.skills && candidate.skills) {
        const userSkills = user.skills.map((s) => s.toLowerCase());
        const candidateSkills = candidate.skills.map((s) => s.toLowerCase());

        const sharedSkills = userSkills.filter((skill) =>
            candidateSkills.includes(skill)
        );

        score += sharedSkills.length * 10;
    }

    // +20 points for matching industry
    if (
        user.lookingFor?.industry &&
        candidate.lookingFor?.industry &&
        user.lookingFor.industry.toLowerCase() ===
        candidate.lookingFor.industry.toLowerCase()
    ) {
        score += 20;
    }

    return score;
};
