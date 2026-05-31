import os
import subprocess
import re
import json
from pathlib import Path

ebooks_root = Path("/home/team/shared/ebooks")
pdf_dir = Path("/home/team/shared/storefront/assets/pdfs")
pdf_dir.mkdir(parents=True, exist_ok=True)

# Map categories to high-quality Unsplash images
category_images = {
    "cooking": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=400",
    "weight-loss": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400",
    "health": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400",
    "diy": "https://images.unsplash.com/photo-1581578731522-7b5def47756d?auto=format&fit=crop&q=80&w=400",
    "make-money": "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=400",
    "side-hustles": "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=400",
    "hair-care": "https://images.unsplash.com/photo-1522337360788-8b13df772f98?auto=format&fit=crop&q=80&w=400",
    "kids": "https://images.unsplash.com/photo-1472162014730-68d2c4dc0f61?auto=format&fit=crop&q=80&w=400",
    "home-maintenance": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400"
}

ebook_data = []

# Canonical categories to scan
CANONICAL_CATEGORIES = [
    'cooking',
    'weight-loss',
    'diy',
    'make-money',
    'hair-care',
    'kids',
    'home-maintenance'
]

# Walk through the ebooks directory
for cat_dir in ebooks_root.iterdir():
    if not cat_dir.is_dir():
        continue
    
    category = cat_dir.name
    
    # Only process canonical categories
    if category not in CANONICAL_CATEGORIES:
        print(f"Skipping non-canonical category directory: {category}")
        continue
    
    for ebook_dir in cat_dir.iterdir():
        if not ebook_dir.is_dir():
            continue
            
        slug = ebook_dir.name
        html_file = ebook_dir / "ebook.html"
        
        if not html_file.exists():
            continue
            
        pdf_file = pdf_dir / f"{slug}.pdf"
        
        # Extract metadata from HTML
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
            title_match = re.search(r"<title>(.*?)</title>", content)
            title = title_match.group(1) if title_match else slug.replace("-", " ").title()
            
            # Clean text for descriptions
            text_content = re.sub(r"<style.*?>.*?</style>", "", content, flags=re.DOTALL)
            text_content = re.sub(r"<.*?>", " ", text_content)
            text_content = re.sub(r"\s+", " ", text_content).strip()
            
            # Avoid picking up the title/nav in description
            description = text_content[:150] + "..."
            longDescription = text_content[:600] + "..."
            
        # Pre-generate PDF if it doesn't exist or if needed
        # (Forcing generation now to ensure everything is up to date)
        print(f"Ensuring PDF for {slug}...")
        try:
            # Check if PDF exists and is non-zero size, skip if already exists to save time?
            # Actually, let's just generate it to be sure.
            subprocess.run(["wkhtmltopdf", "--enable-local-file-access", "-q", str(html_file), str(pdf_file)], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Error generating PDF for {slug}: {e}")

        ebook_data.append({
            "id": slug,
            "title": title,
            "category": category,
            "description": description,
            "longDescription": longDescription,
            "price": 1.00,
            "pdfPath": f"assets/pdfs/{slug}.pdf",
            "image": category_images.get(category, "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=400")
        })

# Sort ebook_data by category then title for consistent display
ebook_data.sort(key=lambda x: (x['category'], x['title']))

# Output as a JS file for the storefront
with open("/home/team/shared/storefront/ebook_data.js", "w") as f:
    f.write("const ebooks = ")
    json.dump(ebook_data, f, indent=4)
    f.write(";")

print(f"Successfully generated data for {len(ebook_data)} ebooks.")
