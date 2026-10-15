<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigratePrivateFilesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'storage:migrate-private-files {--dry-run : Simulate the migration without moving files}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate sensitive customer files (prescriptions, discount_ids, payment_receipts, chat_images) from public to private storage';

    /**
     * Sensitive folder directories to migrate.
     *
     * @var array<string>
     */
    private const SENSITIVE_DIRECTORIES = [
        'chat_images',
        'discount_ids',
        'payment_receipts',
        'prescriptions',
    ];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $isDryRun = (bool) $this->option('dry-run');

        $this->info($isDryRun ? 'Starting dry-run migration to private storage...' : 'Starting migration to private storage...');

        $publicDisk = Storage::disk('public');
        $privateDisk = Storage::disk('local');

        $totalMigrated = 0;
        $totalErrors = 0;

        foreach (self::SENSITIVE_DIRECTORIES as $directory) {
            $this->line("Checking directory: {$directory}");

            $files = $publicDisk->allFiles($directory);

            if (empty($files)) {
                $this->comment("  No files found in public/{$directory}");
                continue;
            }

            $this->info("  Found " . count($files) . " file(s) in public/{$directory}");

            foreach ($files as $file) {
                try {
                    if ($isDryRun) {
                        $this->line("  [DRY-RUN] Would move: {$file}");
                        $totalMigrated++;
                        continue;
                    }

                    $stream = $publicDisk->readStream($file);
                    if ($stream === false) {
                        $this->error("  Failed to read file stream: {$file}");
                        $totalErrors++;
                        continue;
                    }

                    $writeSuccess = $privateDisk->writeStream($file, $stream);
                    if (is_resource($stream)) {
                        fclose($stream);
                    }

                    if (!$writeSuccess || !$privateDisk->exists($file)) {
                        $this->error("  Failed to write to private disk: {$file}");
                        $totalErrors++;
                        continue;
                    }

                    // Verify size
                    $publicSize = $publicDisk->size($file);
                    $privateSize = $privateDisk->size($file);

                    if ($publicSize !== $privateSize) {
                        $this->error("  Size mismatch for {$file} (public: {$publicSize}, private: {$privateSize})");
                        $totalErrors++;
                        continue;
                    }

                    // Delete original from public disk
                    $publicDisk->delete($file);
                    $this->line("  Migrated and removed from public: {$file}");
                    $totalMigrated++;
                } catch (\Throwable $e) {
                    $this->error("  Error migrating {$file}: " . $e->getMessage());
                    $totalErrors++;
                }
            }

            // Remove empty subdirectories on public disk
            if (!$isDryRun) {
                $remainingFiles = $publicDisk->allFiles($directory);
                if (empty($remainingFiles)) {
                    $publicDisk->deleteDirectory($directory);
                    $this->comment("  Removed empty public directory: {$directory}");
                }
            }
        }

        $this->newLine();
        if ($isDryRun) {
            $this->info("Dry-run complete. {$totalMigrated} file(s) would be migrated to private storage.");
        } else {
            $this->info("Migration complete. {$totalMigrated} file(s) moved to private storage. ({$totalErrors} errors)");
        }

        return $totalErrors === 0 ? Command::SUCCESS : Command::FAILURE;
    }
}

