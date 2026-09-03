<?php

use App\Models\Ticket;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->string('ticket_reference_id')->unique()->nullable()->after('id');
        });

        // Populate existing tickets with reference IDs if any exist
        $tickets = Ticket::whereNull('ticket_reference_id')->get();
        foreach ($tickets as $ticket) {
            $dateStr = $ticket->created_at ? $ticket->created_at->format('Ymd') : now()->format('Ymd');
            $random = strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
            $ticket->update([
                'ticket_reference_id' => "TICK-{$dateStr}-{$random}"
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn('ticket_reference_id');
        });
    }
};

