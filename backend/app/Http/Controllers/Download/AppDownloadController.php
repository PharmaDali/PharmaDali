<?php

namespace App\Http\Controllers\Download;

use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AppDownloadController extends Controller
{
    /**
     * Download the Pharmacist Mobile Application APK.
     */
    public function downloadPharmacistApp(): StreamedResponse
    {
        return $this->serveApk('pharmadali-pharmacist.apk', 'PharmaDali-Pharmacist.apk');
    }

    /**
     * Download the Customer Mobile Application APK.
     */
    public function downloadCustomerApp(): StreamedResponse
    {
        return $this->serveApk('pharmadali-customer.apk', 'PharmaDali-Customer.apk');
    }

    /**
     * Stream the APK file in chunks to avoid PHP memory exhaustion on large files.
     *
     * Using StreamedResponse + readfile() with output buffering disabled prevents
     * PHP from loading the entire APK (~85MB) into memory, which causes the download
     * to silently fail or stall at 100% with no file saved on the device.
     */
    private function serveApk(string $filename, string $downloadName): StreamedResponse
    {
        $path = public_path("downloads/{$filename}");

        if (! file_exists($path)) {
            $storagePath = storage_path("app/public/downloads/{$filename}");
            if (file_exists($storagePath)) {
                $path = $storagePath;
            } else {
                abort(404, "The {$downloadName} package is not currently hosted on this server. Please contact support.");
            }
        }

        $fileSize = filesize($path);

        return response()->stream(function () use ($path) {
            // Disable PHP execution time limit for large file transfers.
            set_time_limit(0);

            // Flush any existing output buffers so we stream directly to the client.
            while (ob_get_level() > 0) {
                ob_end_clean();
            }

            // Stream in 1MB chunks — keeps memory usage flat regardless of file size.
            $handle = fopen($path, 'rb');
            if ($handle === false) {
                abort(500, 'Unable to open the APK file for streaming.');
            }

            while (! feof($handle)) {
                echo fread($handle, 1048576); // 1MB per chunk
                flush();
            }

            fclose($handle);
        }, 200, [
            'Content-Type'           => 'application/vnd.android.package-archive',
            'Content-Disposition'    => 'attachment; filename="' . $downloadName . '"',
            'Content-Length'         => $fileSize,
            'Cache-Control'          => 'no-cache, no-store, must-revalidate',
            'Pragma'                 => 'no-cache',
            'Expires'                => '0',
            'X-Content-Type-Options' => 'nosniff',
            'Accept-Ranges'          => 'none',
        ]);
    }
}

