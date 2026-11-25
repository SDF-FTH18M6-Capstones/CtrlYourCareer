import re


INTEREST_CATEGORIES = {
    "Software development": {
        "software development",
        "web development",
        "frontend development",
        "backend development",
        "mobile development",
        "software engineering",
        "computer science",
    },
    "Data & analytics": {
        "data analytics",
        "data science",
        "data engineering",
        "business intelligence",
        "machine learning",
        "artificial intelligence",
    },
    "Design & creativity": {
        "design",
        "graphic design",
        "ui ux",
        "user experience",
        "product design",
        "visual design",
        "creative",
    },
    "Business & finance": {
        "business",
        "finance",
        "accounting",
        "banking",
        "financial analysis",
        "economics",
    },
    "Marketing": {
        "marketing",
        "advertising",
        "branding",
        "market research",
        "public relations",
    },
    "Cybersecurity": {
        "cybersecurity",
        "information security",
        "network security",
        "security analyst",
        "security engineer",
    },
    "Healthcare": {
        "healthcare",
        "medicine",
        "medical",
        "nursing",
        "pharmacy",
        "public health",
    },
    "Engineering": {
        "mechanical engineering",
        "civil engineering",
        "electrical engineering",
        "chemical engineering",
        "industrial engineering",
        "manufacturing",
        "robotics",
        "engineering",
    },
    "Product management": {
        "product management",
        "product manager",
        "product owner",
        "product strategy",
    },
    "Education": {
        "education",
        "teaching",
        "teacher",
        "curriculum",
        "educational technology",
    },
}


def normalize_category(value):
    if not isinstance(value, str):
        return ""

    return re.sub(
        r"\s+",
        " ",
        re.sub(r"[^a-z0-9]+", " ", value.lower()),
    ).strip()


def category_matches_interest(interest, career):
    """
    Determine whether a career belongs to an onboarding interest.

    Prefer the career's explicit category, falling back to its title
    when the category is missing.
    """

    normalized_interest = normalize_category(interest)

    related = None

    for category, keywords in INTEREST_CATEGORIES.items():
        if normalize_category(category) == normalized_interest:
            related = {
                normalize_category(keyword)
                for keyword in keywords
            }
            break

    if related is None:
        related = {normalized_interest}

    career_category = normalize_category(career.category)
    career_title = normalize_category(career.title)

    # Avoid treating software engineering as general engineering.
    if normalized_interest == "engineering":
        excluded = {
            "software engineering",
            "software development",
            "data engineering",
            "data science",
        }

        if career_category in excluded:
            return False

        if not career_category and any(
            keyword in career_title for keyword in excluded
        ):
            return False

    if career_category:
        return any(
            keyword == career_category
            or (
                len(keyword) >= 5
                and keyword in career_category
            )
            for keyword in related
        )

    return any(
        keyword == career_title
        or (
            len(keyword) >= 5
            and keyword in career_title
        )
        for keyword in related
    )