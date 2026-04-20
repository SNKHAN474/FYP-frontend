// utils/imageUtils.ts

const WIDTH = 848;
const HEIGHT = 480;

export async function convertRgb8ToPngUrl(localPath: string): Promise<string> {
	try {
		// 1. Request the local file
		const response = await fetch(localPath);

		if (!response.ok) {
			throw new Error(
				`Could not find file at ${localPath}. Ensure the file is in your 'public' folder.`,
			);
		}

		const buffer = await response.arrayBuffer();
		const rgbData = new Uint8Array(buffer);

		// 2. Setup Canvas
		const canvas = document.createElement('canvas');
		canvas.width = WIDTH;
		canvas.height = HEIGHT;
		const ctx = canvas.getContext('2d');

		if (!ctx) throw new Error('Canvas context not available');

		// 3. Create Image Data (RGBA)
		const imageData = ctx.createImageData(WIDTH, HEIGHT);

		// Convert RGB to RGBA
		for (let i = 0; i < WIDTH * HEIGHT; i++) {
			const r = rgbData[i * 3];
			const g = rgbData[i * 3 + 1];
			const b = rgbData[i * 3 + 2];

			const idx = i * 4;
			imageData.data[idx] = r; // Red
			imageData.data[idx + 1] = g; // Green
			imageData.data[idx + 2] = b; // Blue
			imageData.data[idx + 3] = 255; // Alpha (Fully Opaque)
		}

		ctx.putImageData(imageData, 0, 0);

		// 4. Export as a Data URL (Base64 PNG)
		return canvas.toDataURL('image/png');
	} catch (error) {
		console.error('Error converting RGB8:', error);
		throw error;
	}
}

// Add this Viridis LUT (Lookup Table)
const VIRIDIS_COLORS = [
	[68, 1, 84],
	[72, 31, 112],
	[67, 61, 132],
	[54, 92, 141],
	[43, 117, 142],
	[33, 144, 141],
	[39, 173, 129],
	[92, 200, 99],
	[170, 220, 50],
	[253, 231, 37],
];

// Helper to interpolate colors for smoother gradients
function getViridisColor(t: number): [number, number, number] {
	const i = Math.floor(t * (VIRIDIS_COLORS.length - 1));
	return VIRIDIS_COLORS[Math.min(i, VIRIDIS_COLORS.length - 1)] as [number, number, number];
}

export async function convertDepth16ToPngUrl(localPath: string): Promise<string> {
	const WIDTH = 848;
	const HEIGHT = 480;

	const response = await fetch(localPath);
	const buffer = await response.arrayBuffer();

	// Use DataView to force Little-Endian reading (consistent with your Node backend)
	const view = new DataView(buffer);
	const depthData = new Uint16Array(WIDTH * HEIGHT);
	for (let i = 0; i < WIDTH * HEIGHT; i++) {
		depthData[i] = view.getUint16(i * 2, true);
	}

	// 1. Find min/max for normalization (ignoring 0/no-data)
	let min = 65535,
		max = 0;
	for (let i = 0; i < depthData.length; i++) {
		const d = depthData[i];
		if (d === 0) continue;
		if (d < min) min = d;
		if (d > max) max = d;
	}

	const canvas = document.createElement('canvas');
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	const ctx = canvas.getContext('2d')!;
	const imageData = ctx.createImageData(WIDTH, HEIGHT);

	// 2. Map depth to Viridis color
	for (let i = 0; i < depthData.length; i++) {
		const d = depthData[i];
		const idx = i * 4;

		if (d === 0) {
			imageData.data[idx] = imageData.data[idx + 1] = imageData.data[idx + 2] = 0;
		} else {
			// Normalize to 0-1
			const normalized = Math.max(0, Math.min(1, (d - min) / (max - min)));
			const [r, g, b] = getViridisColor(normalized);

			imageData.data[idx] = r;
			imageData.data[idx + 1] = g;
			imageData.data[idx + 2] = b;
		}
		imageData.data[idx + 3] = 255; // Alpha
	}

	ctx.putImageData(imageData, 0, 0);
	return canvas.toDataURL('image/png');
}
