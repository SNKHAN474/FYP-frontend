// ================= FILE: plyUtils.ts =================
export type Vertex = {
	x: number;
	y: number;
	z: number;
	r: number;
	g: number;
	b: number;
};

export function generateVertices(
	points: { x: number; y: number }[],
	depthData: Uint16Array,
	width: number,
): Vertex[] {
	let vertices: Vertex[] = [];

	let minX = Math.min(...points.map(p => p.x));
	let maxX = Math.max(...points.map(p => p.x));
	let minY = Math.min(...points.map(p => p.y));
	let maxY = Math.max(...points.map(p => p.y));

	for (let y = minY; y < maxY; y++) {
		for (let x = minX; x < maxX; x++) {
			const depth = depthData[y * width + x];
			if (!depth) continue;

			vertices.push({
				x,
				y,
				z: depth * 0.1,
				r: 255,
				g: 255,
				b: 255,
			});
		}
	}

	return vertices;
}

export function downloadPLY(vertices: Vertex[]) {
	let ply = `ply\nformat ascii 1.0\n`;
	ply += `element vertex ${vertices.length}\n`;
	ply += `property float x\nproperty float y\nproperty float z\n`;
	ply += `property uchar red\nproperty uchar green\nproperty uchar blue\nend_header\n`;

	vertices.forEach(v => {
		ply += `${v.x} ${v.y} ${v.z} ${v.r} ${v.g} ${v.b}\n`;
	});

	const blob = new Blob([ply], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = 'pointcloud.ply';
	a.click();
}
