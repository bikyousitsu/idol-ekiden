"""Write a PDF from inspected Artifact Tool slide previews without changing pixels."""
from pathlib import Path
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.utils import ImageReader

material_dir = Path(__file__).resolve().parent.parent
workspace = material_dir.parents[2]
for stem in ('participants', 'staff'):
    frames = workspace / 'work' / 'presentations' / 'build' / stem
    images = sorted(frames.glob('[0-9][0-9].png'))
    if not images:
        raise RuntimeError(f'No inspected slide previews for {stem}')
    pdf = Canvas(str(material_dir / f'{stem}.pdf'), pagesize=(960, 540), pageCompression=1)
    pdf.setTitle('327アイドル駅伝 参加者説明' if stem.startswith('participants') else '327アイドル駅伝 運営説明')
    pdf.setAuthor('')
    for image in images:
        pdf.drawImage(ImageReader(str(image)), 0, 0, width=960, height=540)
        pdf.showPage()
    pdf.save()
    print(f'{stem}.pdf: {len(images)} pages')
