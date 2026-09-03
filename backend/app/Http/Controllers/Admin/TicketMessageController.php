<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketMessageRequest;
use App\Models\Ticket;
use App\Services\Ticket\TicketService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class TicketMessageController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly TicketService $ticketService,
    ) {}

    public function store(StoreTicketMessageRequest $request, Ticket $ticket): JsonResponse
    {
        $message = $this->ticketService->addTicketMessage($request->user(), $ticket, $request->validated(),$request->file('image'));

        return $this->successResponse($message, 'Message added successfully', 201);
    }
}