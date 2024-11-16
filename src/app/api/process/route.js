import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import applyFilter from '@/app/utils/IOhandler';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  const data = await req.formData();
  const file = data.get('file');
  const filter = data.get('filter');

  if (!file || !filter) {
    return NextResponse.json({ error: 'Missing file or filter' }, { status: 400 });
  }

  const tempDir = path.join(process.cwd(), 'temp');
  await fs.mkdir(tempDir, { recursive: true });

  const filePath = path.join(tempDir, file.name);
  const outputFile = path.join(tempDir, `${path.basename(file.name, '.png')}-${filter}.png`);

  await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  await applyFilter(filePath, outputFile, filter);

  try {
    // Upload processed file to Cloudinary
    const result = await cloudinary.uploader.upload(outputFile, {
      folder: 'processed_images',
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ error: 'Cloudinary upload failed' }, { status: 500 });
  }
}
