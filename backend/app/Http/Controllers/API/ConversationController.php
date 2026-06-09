<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConversationMessageRequest;
use App\Http\Requests\StoreConversationRequest;
use App\Models\Conversation;
use App\Services\Messaging\ConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function __construct(private readonly ConversationService $conversationService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        return $this->conversationService->listConversations($request->user());
    }

    public function customerPharmacists(Request $request): JsonResponse
    {
        return $this->conversationService->listContacts($request->user());
    }

    public function pharmacistCustomers(Request $request): JsonResponse
    {
        return $this->conversationService->listContacts($request->user());
    }

    public function store(StoreConversationRequest $request): JsonResponse
    {
        return $this->conversationService->startConversation(
            $request->user(),
            (int) $request->validated()['order_id']
        );
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        return $this->conversationService->showConversation($request->user(), $conversation);
    }

    public function sendMessage(StoreConversationMessageRequest $request, Conversation $conversation): JsonResponse
    {
        return $this->conversationService->sendMessage(
            $request->user(),
            $conversation,
            $request->validated()['body'] ?? null,
            $request->file('image')
        );
    }
}