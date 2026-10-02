"""Create a public copy of the master PDF, removing only its phone number."""
from pathlib import Path
import re
import fitz

source = Path(r"C:\Users\HP\Documents\Codex\2026-09-25\these-are-the-resumes-in-this\outputs\Devyanshu_Agrawal_Software_Engineering_Resume.pdf")
root = Path(__file__).resolve().parents[1]
destination = root / "public/devyanshu-agrawal-master-resume-public.pdf"
proof = root / "tmp/pdfs"
proof.mkdir(parents=True, exist_ok=True)
document = fitz.open(source)
phones = set(re.findall(r"\+91[-\s]*\d{10}", "".join(page.get_text() for page in document)))
assert len(phones) == 1, "Inspect the source before publishing: unexpected phone format."
for page in document:
    for phone in phones:
        for rect in page.search_for(phone):
            # Remove the adjacent separator too, preserving the email's position.
            rect.x1 += 7
            page.add_redact_annot(rect, fill=(1, 1, 1))
    page.apply_redactions()
    for link in page.get_links():
        if link.get("uri", "").startswith("tel:"):
            page.delete_link(link)
document.set_metadata({"title": "Devyanshu Agrawal - Software Engineering Resume", "author": "Devyanshu Agrawal"})
document.save(destination, garbage=4, deflate=True)
document.close()
with fitz.open(destination) as public:
    text = "".join(page.get_text() for page in public)
    assert all(phone not in text for phone in phones)
    assert "Itransition" in text and "i.devyanshv@gmail.com" in text and "8.8/10" in text
    for index, page in enumerate(public):
        page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5)).save(proof / f"master-resume-public-{index + 1}.png")
print(destination)
