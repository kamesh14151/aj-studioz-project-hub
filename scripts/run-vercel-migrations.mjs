import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import pkg from "pg";

const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const migrationsDir = path.join(repoRoot, "supabase", "migrations");

const connectionString =
	process.env.SUPABASE_DB_URL ||
	process.env.DATABASE_URL ||
	process.env.POSTGRES_URL ||
	"";

if (!connectionString) {
	console.log("[migrations] No database URL found. Skipping migrations.");
	process.exit(0);
}

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

const migrationNameRegex = /^(\d+)_.*\.sql$/;

async function getMigrationFiles() {
	const entries = await fs.readdir(migrationsDir, { withFileTypes: true });
	return entries
		.filter((entry) => entry.isFile() && migrationNameRegex.test(entry.name))
		.map((entry) => entry.name)
		.sort((a, b) => a.localeCompare(b));
}

async function ensureMigrationsTable() {
	await client.query(`
		CREATE TABLE IF NOT EXISTS public.app_migrations (
			version TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);
	`);
}

async function isApplied(version) {
	const result = await client.query("SELECT 1 FROM public.app_migrations WHERE version = $1 LIMIT 1", [version]);
	return result.rowCount > 0;
}

async function applyMigration(fileName) {
	const version = fileName.split("_")[0];
	const fullPath = path.join(migrationsDir, fileName);
	const sql = await fs.readFile(fullPath, "utf8");

	if (!sql.trim()) {
		console.log(`[migrations] Skipping empty migration ${fileName}`);
		return;
	}

	if (await isApplied(version)) {
		console.log(`[migrations] Already applied ${fileName}`);
		return;
	}

	console.log(`[migrations] Applying ${fileName}`);
	await client.query("BEGIN");
	try {
		await client.query(sql);
		await client.query(
			"INSERT INTO public.app_migrations (version, name) VALUES ($1, $2)",
			[version, fileName]
		);
		await client.query("COMMIT");
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
	}
}

async function run() {
	await client.connect();

	try {
		await ensureMigrationsTable();
		const files = await getMigrationFiles();

		if (files.length === 0) {
			console.log("[migrations] No migration files found.");
			return;
		}

		for (const fileName of files) {
			await applyMigration(fileName);
		}

		console.log("[migrations] Migration run complete.");
	} finally {
		await client.end();
	}
}

run().catch((error) => {
	console.error("[migrations] Failed:", error.message);
	process.exit(1);
});
