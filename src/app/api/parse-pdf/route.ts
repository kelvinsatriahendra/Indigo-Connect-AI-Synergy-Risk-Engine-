import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Tidak ada file yang diunggah' },
        { status: 400 }
      );
    }

    // Convert standard File to Buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Dynamically import pdf-parse and cast to any to avoid TS definition issues
    const pdfParseModule = (await import('pdf-parse')) as any;
    // Handle both ESM default and CommonJS export structures
    const pdfParse = pdfParseModule.default || pdfParseModule;
    
    // Parse the PDF
    const data = await (typeof pdfParse === 'function' ? pdfParse(buffer) : pdfParse.default(buffer));
    
    return NextResponse.json({ 
      text: data.text,
      pages: data.numpages,
      info: data.info 
    });
  } catch (error) {
    console.error('PDF parsing error:', error);
    return NextResponse.json(
      { error: 'Gagal membaca file PDF. Pastikan file tidak rusak atau memiliki format yang didukung.' },
      { status: 500 }
    );
  }
}
