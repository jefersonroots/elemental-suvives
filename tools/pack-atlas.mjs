import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const outDir = path.resolve('public/atlas');
const manifestPath = path.join(outDir, 'manifest.json');

await mkdir(outDir, { recursive: true });

const manifest = {
  generatedAt: new Date().toISOString(),
  atlases: [],
  note: 'Placeholder atlas manifest. Replace with real spritesheet packing before dense enemy rendering.',
};

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(`Wrote ${path.relative(process.cwd(), manifestPath)}`);
