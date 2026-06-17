import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = file.name.toLowerCase();
    let text: string;

    if (name.endsWith('.pdf')) {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      text = result.text;
    } else if (name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (name.endsWith('.txt')) {
      text = buffer.toString('utf-8');
    } else {
      return Response.json({ error: 'Unsupported file type. Use PDF, DOCX, or TXT.' }, { status: 415 });
    }

    return Response.json({ text: text.trim().slice(0, 8000) });
  } catch (err) {
    console.error('parse-resume error:', err);
    return Response.json({ error: 'Failed to parse file.' }, { status: 500 });
  }
}
