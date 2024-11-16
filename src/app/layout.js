import './globals.css';

export const metadata = {
	title: 'Image Filter Application',
	description: 'Takes a PNG image and applies a filter to it',
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className=' bg-neutral-800 text-neutral-200 container mx-auto max-w-5xl text-center '>{children}</body>
		</html>
	);
}
