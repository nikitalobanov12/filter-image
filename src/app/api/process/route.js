// /app/api/process/route.js
import path from 'path';
import fs from 'fs/promises';
import { NextResponse } from 'next/server';
import applyFilter  from '@/app/utils/IOhandler';

export async function POST(req) {
    const data = await req.formData();
    const file = data.get('file');
    const filter = data.get('filter');
  
    if (!file || !filter) {
      return NextResponse.json({ error: 'Missing file or filter' }, { status: 400 });
    }
  
    const publicDir = path.join(process.cwd(), 'public/outputs');
    await fs.mkdir(publicDir, { recursive: true });
  
    const filePath = path.join(publicDir, file.name);
    const outputFile = path.join(publicDir, `${path.basename(file.name, '.png')}-${filter}.png`);
  
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
    await applyFilter(filePath, outputFile, filter);
  
    const relativeUrl = `/outputs/${path.basename(outputFile)}`;
    return NextResponse.json({ url: relativeUrl });
  }