'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function UploadPage() {
	const [file, setFile] = useState(null);
	const [filter, setFilter] = useState('');
	const [outputUrl, setOutputUrl] = useState(null);

	const handleUpload = async e => {
		e.preventDefault();
		if (!file || !filter) return alert('Please select a file and filter');

		const formData = new FormData();
		formData.append('file', file);
		formData.append('filter', filter);

		const res = await fetch('/api/process', {
			method: 'POST',
			body: formData,
		});

		const data = await res.json();
		if (data.error) {
			alert(data.error);
		} else {
			setOutputUrl(data.url);
		}
	};

	return (
    <div className="p-8">
    <h1 className="text-5xl font-bold text-center mb-8">Upload and Process Image</h1>
    <form 
      onSubmit={handleUpload} 
      className="bg-neutral-700 p-6 max-w-lg mx-auto rounded-lg shadow-lg flex flex-col gap-6"
    >
      <label className="block text-left text-neutral-300">
        <span className="block mb-2 font-medium">Upload Image (PNG Only):</span>
        <input
          type="file"
          className="w-full px-4 py-2 bg-neutral-800 text-neutral-100 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          accept="image/png"
          onChange={e => setFile(e.target.files[0])}
        />
      </label>
      <label className="block text-left text-neutral-300">
        <span className="block mb-2 font-medium">Choose a Filter:</span>
        <select
          className="w-full px-4 py-2 bg-neutral-800 text-neutral-100 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={e => setFilter(e.target.value)}
        >
          <option value="" disabled className="text-neutral-400">Select a filter</option>
          <option value="grayscale">Grayscale</option>
          <option value="invert">Invert</option>
          <option value="sepiaFilter">Sepia</option>
          <option value="brightnessFilter">Brightness</option>
          <option value="contrastFilter">Contrast</option>
          <option value="thresholdFilter">Threshold</option>
          <option value="vintageFilter">Vintage</option>
          <option value="warmFilter">Warm</option>
          <option value="coolFilter">Cool</option>
          <option value="fadeFilter">Fade</option>
          <option value="dramaticFilter">Dramatic</option>
          <option value="vibrantFilter">Vibrant</option>
          <option value="original">Original</option>

          
        </select>
      </label>
      <button
        type="submit"
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-lg transition-all"
      >
        Upload
      </button>
    </form>
    {outputUrl && (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Processed Image:</h2>
        <Image
          src={outputUrl}
          alt="Processed"
          width={1000}
          height={1000}
          quality={100}
          className="mx-auto object-fit rounded-lg border border-neutral-600 shadow-lg"
        />
        <div className="mt-4">
						<Link
							href={outputUrl}
							target="_blank"
							download
							className="inline-block px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-lg transition-all"
						>
							Download Processed Image
						</Link>
					</div>
      </div>
    )}
  </div>
	);
}
