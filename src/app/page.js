'use client';
import { useState } from 'react';
import { CldImage } from 'next-cloudinary';

export default function UploadPage() {
	const [file, setFile] = useState(null);
	const [filter, setFilter] = useState('grayscale'); //initialize the filter with grayscale (first option in the form)
	const [outputUrl, setOutputUrl] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleUpload = async event => {
		event.preventDefault();
		if (!file) return alert('Please upload a file'); //if there is no file in the form, send an alert to the user.
		setIsLoading(true);
		const formData = new FormData();
		formData.append('file', file);
		formData.append('filter', filter);

		try {
			const res = await fetch('/api/process', {
				method: 'POST',
				body: formData,
			});

			if (!res.ok) {
				const errorData = await res.json();
				alert(`Error: ${errorData.error || 'Unknown error occurred'}`);
				return;
			}

			const data = await res.json();
			// console.log('Output URL:', data.url); // Log the URL
			setOutputUrl(data.url);
		} catch (error) {
			console.error('Error uploading file:', error);
			alert('An unexpected error occurred. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="p-8  min-h-screen text-neutral-100">
			<header className="text-center mb-12">
				<h1 className="text-6xl font-extrabold text-blue-400">
					Image Magic
				</h1>
				<p className="text-lg mt-4 text-neutral-300">
					Upload your image, apply creative filters, and download the
					masterpiece!
				</p>
			</header>
			<main className="max-w-2xl mx-auto">
				<form
					onSubmit={handleUpload}
					className="bg-neutral-700 p-6 rounded-xl shadow-lg space-y-6"
				>
					<div className="text-left">
						<label className="block text-sm font-medium mb-2">
							Upload Image (PNG or JPEG):
						</label>
						<input
							type="file"
							className="w-full px-4 py-2 bg-neutral-800 text-neutral-100 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							accept="image/png, image/jpeg"
							onChange={event => setFile(event.target.files[0])}
						/>
					</div>
					<div className="text-left">
						<label className="block text-sm font-medium mb-2">
							Choose a Filter:
						</label>
						<select
							className="w-full px-4 py-2 bg-neutral-800 text-neutral-100 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							onChange={event => setFilter(event.target.value)}
						>
							<option
								value=""
								disabled
								className="text-neutral-400"
							>
								Select a filter
							</option>
							<option value="grayscale">Grayscale Filter</option>
							<option value="invert">Invert Colors</option>
							<option value="sepia">Sepia Filter</option>
							<option value="brightness">
								Increase Brightness
							</option>
							<option value="contrast">Increase Contrast</option>
							<option value="threshold">Threshold Filter</option>
							<option value="vintage">Vintage Filter</option>
							<option value="warm">Warm Filter</option>
							<option value="cool">Cool Filter</option>
							<option value="fade">Fade Filter</option>
							<option value="dramatic">Dramatic Filter</option>
							<option value="vibrant">Vibrant Filter</option>
							<option value="original">
								Original (no filter)
							</option>
						</select>
					</div>
					<button
						type="submit"
						className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all"
					>
						{isLoading ? 'Uploading' : 'Upload'}
					</button>
					{isLoading && (
						<div className="mt-6 text-center">
							<p className="text-lg text-neutral-400">
								Processing your image...
							</p>
							<div className="spinner mt-4 w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
						</div>
					)}
				</form>
				{outputUrl ? (
					<section className="mt-12 text-center">
						<h2 className="text-3xl font-bold mb-6">
							Your Processed Image
						</h2>
						<CldImage
							cloudname={
								process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
							}
							src={outputUrl}
							alt="Processed Image"
							width={1000}
							height={1000}
							className="mx-auto object-cover rounded-lg border border-neutral-600 shadow-lg"
						/>
						<div className="mt-6">
							<a
								href={outputUrl}
								target="_blank"
								rel="noopener noreferrer"
								download
								className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition-all"
							>
								Download Processed Image
							</a>
						</div>
					</section>
				) : (
					<p className="text-center text-neutral-400 mt-8">
						No image uploaded yet. Upload an image to see magic
						happen!
					</p>
				)}
			</main>
		</div>
	);
}
