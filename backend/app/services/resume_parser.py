import re


class ResumeParser:

    @staticmethod
    def extract_email(text: str):
        pattern = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"
        match = re.search(pattern, text)

        return match.group() if match else None

    @staticmethod
    def extract_phone(text: str):
        pattern = r"(\+?\d[\d\s-]{8,}\d)"
        match = re.search(pattern, text)

        return match.group() if match else None

    @staticmethod
    def extract_name(text: str):
        """
        Assumption:
        Candidate's name is usually one of the first non-empty lines.
        """

        lines = [line.strip() for line in text.split("\n") if line.strip()]

        return lines[0] if lines else None

    @staticmethod
    def parse(text: str):

        return {
            "name": ResumeParser.extract_name(text),
            "email": ResumeParser.extract_email(text),
            "phone": ResumeParser.extract_phone(text),
        }