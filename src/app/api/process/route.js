import { v2 as cloudinary } from 'cloudinary';
import { PNG } from 'pngjs';
import applyFilter from '@/app/utils/IOhandler';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
	try {
		console.log('api route called');
		const data = await req.formData();
		const file = data.get('file'); // Get the uploaded file
		const filter = data.get('filter'); // Get the selected filter

		// Validate input
		if (!file || !filter) {
			return NextResponse.json(
				{ error: 'Missing file or filter' },
				{ status: 400 }
			);
		}

		// Validate file type
		const validTypes = ['image/png', 'image/jpeg'];
		if (!validTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: 'Unsupported file type' },
				{ status: 400 }
			);
		}

		console.log('Received file and filter:', file.name, filter);

		// Read file buffer
		const fileBuffer = Buffer.from(await file.arrayBuffer());
		console.log('File buffer size:', fileBuffer.length);

		// Process the image with sharp
		let image = sharp(fileBuffer);

		// Apply filter logic using sharp
    switch (filter) {
      case 'grayscale':
        image = image.grayscale();
        break;

      case 'invert':
        image = image.negate();
        break;

      case 'sepia':
        image = image.recomb([
          [0.393, 0.769, 0.189],
          [0.349, 0.686, 0.168],
          [0.272, 0.534, 0.131],
        ]);
        break;

      case 'brightness':
        image = image.modulate({ brightness: 1.5 }); // Brighten by 50%
        break;

      case 'contrast':
        image = image.linear(2, -128); // Increase contrast
        break;

      case 'threshold':
        image = image.threshold(128); // Binary threshold
        break;

      case 'vintage':
        image = image.tint({ r: 230, g: 190, b: 160 }); // Soft warm tint
        break;

      case 'warm':
        image = image.modulate({ saturation: 1.2, brightness: 1.1 }); // Boost warmth
        break;

      case 'cool':
        image = image.modulate({ hue: 220, saturation: 0.9 }); // Cool tone adjustment
        break;

      case 'fade':
        image = image.modulate({ brightness: 0.85, saturation: 0.85 }); // Faded effect
        break;

      case 'dramatic':
        image = image.linear(1.5, -50).modulate({ saturation: 1.1 }); // High contrast, slight boost in saturation
        break;

      case 'vibrant':
        image = image.modulate({ saturation: 1.5 }); // Boost colors vibrantly
        break;

      default:
        console.log('Unknown filter, no changes applied');
    }

		// Convert processed image to buffer
		const processedBuffer = await image.toBuffer();
		console.log('Processed buffer size:', processedBuffer.length);

		// Upload the processed image to Cloudinary
		const uploadResult = await new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: 'processed_images',
					use_filename: true,
					unique_filename: false,
					overwrite: true,
					resource_type: 'image', // Ensure Cloudinary treats it as an image
				},
				(error, result) => {
					if (error) {
						console.error('Cloudinary upload error:', error);
						reject(error);
					} else {
						resolve(result);
					}
				}
			);
			uploadStream.end(processedBuffer); // Send processed image buffer to Cloudinary
		});


		// Return the secure URL of the uploaded image
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
