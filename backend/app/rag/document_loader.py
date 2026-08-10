from pathlib import Path
import fitz  


class DocumentLoader:

    def load(self, file_path: str) -> str:

        suffix = Path(file_path).suffix.lower()

        if suffix == ".pdf":
            return self._load_pdf(file_path)

        elif suffix == ".txt":
            return self._load_txt(file_path)

        else:
            raise ValueError(f"Unsupported file type: {suffix}")

    def _load_pdf(self, file_path: str) -> str:

        text = ""

        doc = fitz.open(file_path)

        for page in doc:
            text += page.get_text()

        doc.close()

        return text

    def _load_txt(self, file_path: str) -> str:

        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()