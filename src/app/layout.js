import './globals.css';

export const metadata = {
	title: 'Image Filter Application',
	description: 'Takes a PNG image and applies a filter to it',
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className=' bg-gradient-to-b from-gray-800 to-gray-900 text-neutral-200 container mx-auto max-w-5xl text-center '>{children}</body>
		</html>
	);
}
