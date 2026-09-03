<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Models\Ticket;
use App\Services\Ticket\TicketService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly TicketService $ticketService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $tickets = $this->ticketService->listTickets($request->user(), $request->all());

        return $this->successResponse($tickets);
    }

    public function store(StoreTicketRequest $request): JsonResponse
    {
        $ticket = $this->ticketService->createTicket($request->user(), $request->validated());

        return $this->successResponse($ticket, 'Ticket created successfully', 201);
    }

    public function show(Request $request, Ticket $ticket): JsonResponse
    {
        $ticketDetails = $this->ticketService->getTicketDetails($request->user(), $ticket);

        return $this->successResponse($ticketDetails);
    }

    public function updateStatus(UpdateTicketStatusRequest $request, Ticket $ticket): JsonResponse
    {
        $updatedTicket = $this->ticketService->updateTicketStatus(
            $request->user(),
            $ticket,
            $request->validated()['status']
        );

        return $this->successResponse($updatedTicket, 'Ticket status updated successfully');
    }
}