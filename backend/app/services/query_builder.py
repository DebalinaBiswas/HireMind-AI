class QueryBuilder:

    @staticmethod
    def build(parsed_resume, role):

        parts = []

        # =====================================================
        # ROLE
        # =====================================================

        if role:
            parts.append(str(role))

        # =====================================================
        # TECHNICAL SKILLS
        # =====================================================

        technical_skills = parsed_resume.get(
            "technical_skills",
            parsed_resume.get("skills", [])
        )

        if isinstance(technical_skills, dict):

            for value in technical_skills.values():

                if isinstance(value, list):
                    parts.extend(
                        str(item)
                        for item in value
                        if item
                    )

                elif value:
                    parts.append(str(value))

        elif isinstance(technical_skills, list):

            parts.extend(
                str(skill)
                for skill in technical_skills
                if skill
            )

        elif technical_skills:

            parts.append(str(technical_skills))

        # =====================================================
        # PROJECTS
        # =====================================================

        projects = parsed_resume.get(
            "projects",
            []
        )

        if isinstance(projects, list):

            for project in projects:

                # ---------------------------------------------
                # Project stored as dictionary
                # ---------------------------------------------

                if isinstance(project, dict):

                    project_name = project.get(
                        "name",
                        ""
                    )

                    description = project.get(
                        "description",
                        ""
                    )

                    technologies = project.get(
                        "technologies",
                        project.get(
                            "tech_stack",
                            []
                        )
                    )

                    if project_name:
                        parts.append(
                            str(project_name)
                        )

                    if description:
                        parts.append(
                            str(description)
                        )

                    if isinstance(
                        technologies,
                        list
                    ):

                        parts.extend(
                            str(tech)
                            for tech in technologies
                            if tech
                        )

                    elif technologies:

                        parts.append(
                            str(technologies)
                        )

                # ---------------------------------------------
                # Project stored as string
                # ---------------------------------------------

                elif isinstance(
                    project,
                    str
                ):

                    parts.append(project)

        # =====================================================
        # EXPERIENCE
        # =====================================================

        experience = parsed_resume.get(
            "experience",
            []
        )

        if isinstance(experience, list):

            for item in experience:

                if isinstance(item, dict):

                    company = item.get(
                        "company",
                        ""
                    )

                    position = item.get(
                        "position",
                        item.get(
                            "role",
                            ""
                        )
                    )

                    description = item.get(
                        "description",
                        ""
                    )

                    if company:
                        parts.append(
                            str(company)
                        )

                    if position:
                        parts.append(
                            str(position)
                        )

                    if description:
                        parts.append(
                            str(description)
                        )

                elif isinstance(
                    item,
                    str
                ):

                    parts.append(item)

        # =====================================================
        # REMOVE EMPTY VALUES
        # =====================================================

        cleaned_parts = []

        for part in parts:

            if part is None:
                continue

            part = str(part).strip()

            if part:
                cleaned_parts.append(part)

        # =====================================================
        # REMOVE DUPLICATES
        # =====================================================

        unique_parts = list(
            dict.fromkeys(
                cleaned_parts
            )
        )

        # =====================================================
        # FINAL QUERY
        # =====================================================

        search_query = " ".join(
            unique_parts
        )

        return search_query