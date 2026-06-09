<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('conversations')) {
            Schema::create('conversations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->nullable()->constrained('orders')->cascadeOnDelete();
                $table->foreignId('pharmacy_id')->nullable()->constrained('branches')->cascadeOnDelete();
                $table->foreignId('customer_user_id')->nullable()->constrained('users')->cascadeOnDelete();
                $table->foreignId('assigned_pharmacist_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('status', 30)->default('open');
                $table->timestamp('last_message_at')->nullable();
                $table->timestamp('closed_at')->nullable();
                $table->timestamps();

                $table->unique('order_id');
                $table->index(['pharmacy_id', 'last_message_at']);
                $table->index(['customer_user_id', 'last_message_at']);
                $table->index(['assigned_pharmacist_user_id', 'last_message_at']);
            });
        } else {
            Schema::table('conversations', function (Blueprint $table) {
                if (Schema::hasColumn('conversations', 'branch_id')) {
                    $table->dropForeign(['branch_id']);
                    $table->dropIndex(['branch_id', 'last_message_at']);
                    $table->dropColumn('branch_id');
                }

                if (Schema::hasColumn('conversations', 'pharmacist_user_id')) {
                    $table->dropForeign(['pharmacist_user_id']);
                    $table->dropForeign(['customer_user_id']);
                    $table->dropUnique(['customer_user_id', 'pharmacist_user_id']);
                    $table->dropColumn('pharmacist_user_id');
                }
            });

            Schema::table('conversations', function (Blueprint $table) {
                if (!Schema::hasColumn('conversations', 'order_id')) {
                    $table->foreignId('order_id')->nullable()->after('id')->constrained('orders')->cascadeOnDelete();
                }

                if (!Schema::hasColumn('conversations', 'pharmacy_id')) {
                    $table->foreignId('pharmacy_id')->nullable()->after('order_id')->constrained('branches')->cascadeOnDelete();
                }

                if (Schema::hasColumn('conversations', 'customer_user_id')) {
                    $table->foreignId('customer_user_id')->nullable()->change();
                    $table->foreign('customer_user_id')->references('id')->on('users')->cascadeOnDelete();
                }

                if (!Schema::hasColumn('conversations', 'assigned_pharmacist_user_id')) {
                    $table->foreignId('assigned_pharmacist_user_id')->nullable()->after('customer_user_id')->constrained('users')->nullOnDelete();
                }

                if (!Schema::hasColumn('conversations', 'status')) {
                    $table->string('status', 30)->default('open')->after('assigned_pharmacist_user_id');
                }

                if (!Schema::hasColumn('conversations', 'last_message_at')) {
                    $table->timestamp('last_message_at')->nullable()->after('status');
                }

                if (!Schema::hasColumn('conversations', 'closed_at')) {
                    $table->timestamp('closed_at')->nullable()->after('last_message_at');
                }
            });

            Schema::table('conversations', function (Blueprint $table) {
                $table->unique('order_id');
                $table->index(['pharmacy_id', 'last_message_at']);
                $table->index(['customer_user_id', 'last_message_at']);
                $table->index(['assigned_pharmacist_user_id', 'last_message_at']);
            });
        }

        if (!Schema::hasTable('conversation_participants')) {
            Schema::create('conversation_participants', function (Blueprint $table) {
                $table->id();
                $table->foreignId('conversation_id')->constrained('conversations')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('participant_role', 30);
                $table->timestamp('joined_at')->nullable();
                $table->timestamp('left_at')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->unique(['conversation_id', 'user_id']);
                $table->index(['conversation_id', 'is_active']);
            });
        }

        if (!Schema::hasTable('conversation_assignments')) {
            Schema::create('conversation_assignments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('conversation_id')->constrained('conversations')->cascadeOnDelete();
                $table->foreignId('pharmacist_user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('assigned_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('assigned_at')->nullable();
                $table->timestamp('released_at')->nullable();
                $table->boolean('is_current')->default(true);
                $table->timestamps();

                $table->index(['conversation_id', 'is_current']);
                $table->index(['pharmacist_user_id', 'is_current']);
            });
        }

        if (!Schema::hasTable('conversation_messages')) {
            Schema::create('conversation_messages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('conversation_id')->constrained('conversations')->cascadeOnDelete();
                $table->foreignId('sender_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('message_type', 30)->default('user');
                $table->string('visibility', 30)->default('public');
                $table->text('body')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamp('read_at')->nullable();
                $table->timestamps();

                $table->index(['conversation_id', 'created_at']);
                $table->index(['sender_user_id', 'read_at']);
                $table->index(['conversation_id', 'visibility', 'message_type'], 'conv_messages_vis_type_index');
            });
        } else {
            Schema::table('conversation_messages', function (Blueprint $table) {
                if (Schema::hasColumn('conversation_messages', 'sender_user_id')) {
                    $table->dropForeign(['sender_user_id']);
                }
            });

            Schema::table('conversation_messages', function (Blueprint $table) {
                if (Schema::hasColumn('conversation_messages', 'sender_user_id')) {
                    $table->foreignId('sender_user_id')->nullable()->change();
                    $table->foreign('sender_user_id')->references('id')->on('users')->nullOnDelete();
                } else {
                    $table->foreignId('sender_user_id')->nullable()->after('conversation_id')->constrained('users')->nullOnDelete();
                }

                if (Schema::hasColumn('conversation_messages', 'body')) {
                    $table->text('body')->nullable()->change();
                }

                if (!Schema::hasColumn('conversation_messages', 'message_type')) {
                    $table->string('message_type', 30)->default('user')->after('sender_user_id');
                }

                if (!Schema::hasColumn('conversation_messages', 'visibility')) {
                    $table->string('visibility', 30)->default('public')->after('message_type');
                }

                if (!Schema::hasColumn('conversation_messages', 'metadata')) {
                    $table->json('metadata')->nullable()->after('body');
                }
            });

            Schema::table('conversation_messages', function (Blueprint $table) {
                $table->index(['conversation_id', 'visibility', 'message_type'], 'conv_messages_vis_type_index');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('conversation_assignments');
        Schema::dropIfExists('conversation_participants');
        Schema::dropIfExists('conversation_messages');
        Schema::dropIfExists('conversations');
    }
};
