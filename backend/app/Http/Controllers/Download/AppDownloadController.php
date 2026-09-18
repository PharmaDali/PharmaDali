<?php

namespace App\Http\Controllers\Download;

use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AppDownloadController extends Controller
{
    /**
     * Download the Pharmacist Mobile Application APK.
     */
    public function downloadPharmacistApp(): BinaryFileResponse
    {
        return $this->serveApk('pharmadali-pharmacist.apk', 'PharmaDali-Pharmacist.apk');
    }

    /**
     * Helper to resolve and stream the APK file with proper Android MIME headers.
     */
    private function serveApk(string $filename, string $downloadName): BinaryFileResponse
    {
        $path = public_path("downloads/{$filename}");

        if (!file_exists($path)) {
            $storagePath = storage_path("app/public/downloads/{$filename}");
            if (file_exists($storagePath)) {
                $path = $storagePath;
            } else {
                abort(404, "The {$downloadName} package is not currently hosted on this server. Please contact support.");
            }
        }

        return response()->download($path, $downloadName, [
            'Content-Type' => 'application/vnd.android.package-archive',
            'Content-Disposition' => 'attachment; filename="' . $downloadName . '"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }
}
