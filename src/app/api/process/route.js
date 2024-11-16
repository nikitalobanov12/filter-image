import { v2 as cloudinary } from 'cloudinary';
import { PNG } from 'pngjs';
import applyFilter from '@/app/utils/IOhandler';
import { NextResponse } from 'next/server';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
	try {
    console.log('api route called')
		const data = await req.formData();
		const file = data.get('file'); // Uploaded file
		const filter = data.get('filter'); // Selected filter

		if (!file || !filter) {
			return NextResponse.json(
				{ error: 'Missing file or filter' },
				{ status: 400 }
			);
		}

		// Convert uploaded file to a buffer
		const fileBuffer = Buffer.from(await file.arrayBuffer());

		// Parse PNG from the buffer
		const png = PNG.sync.read(fileBuffer);

		// Apply the filter to the PNG in memory
		applyFilter(png.data, png.width, png.height, filter);

		// Encode the modified PNG back to a buffer
		const processedBuffer = PNG.sync.write(png);

		// Upload the processed buffer to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'processed_images',
          use_filename: true,
          unique_filename: false,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error); // Log the error
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result); // Log the result
            resolve(result);
          }
        }
      );
      uploadStream.end(processedBuffer); // Send the processed buffer to Cloudinary
    });
      // console.log('Returning response:', { url: uploadResult.secure_url });
		return NextResponse.json({ url: uploadResult.secure_url });
	} catch (error) {
		console.error('Error in /api/process:', error.message);
		console.error(error.stack);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
