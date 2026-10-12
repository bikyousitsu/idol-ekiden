"""Create a projection PDF from reviewed slide PNGs. No PowerPoint authoring here."""
import argparse
from pathlib import Path
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.utils import ImageReader
parser=argparse.ArgumentParser()
parser.add_argument('frames',type=Path)
parser.add_argument('output',type=Path)
args=parser.parse_args()
pages=sorted(args.frames.glob('[0-9][0-9].png'))
if not pages: raise RuntimeError('No reviewed slide images')
pdf=Canvas(str(args.output),pagesize=(960,540),pageCompression=1)
pdf.setTitle('327アイドル駅伝 '+('武道館ライブ' if 'budokan' in args.output.name else '開会式'))
pdf.setAuthor('')
for page in pages:
    pdf.drawImage(ImageReader(str(page)),0,0,width=960,height=540)
    pdf.showPage()
pdf.save()
print(f'{len(pages)} pages exported')
