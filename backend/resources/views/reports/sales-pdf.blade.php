<!DOCTYPE html>
<html>
<head>
    <title>Sales Report</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 30px; font-size: 13px; }
        .header { margin-bottom: 30px; }
        .title { font-size: 24px; color: #2aabe2; font-weight: bold; margin-bottom: 5px; }
        .subtitle { color: #666; font-size: 12px; }
        .meta { margin-bottom: 20px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #96D2EE; color: #333; font-weight: bold; padding: 10px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #e0e0e0; }
        tr:nth-child(even) td { background: #fafafa; }
        .total { text-align: right; font-weight: bold; font-size: 15px; margin-top: 20px; color: #2aabe2; }
        .footer { margin-top: 50px; text-align: center; color: #aaa; font-size: 10px; }
        @media print {
            body { margin: 20px; }
            button { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Sales Report</div>
        <div class="subtitle">PharmaDali Pharmacy Management System</div>
    </div>
    <div class="meta">
        <strong>Date Range:</strong> {{ $date_range }}<br>
        <strong>Generated On:</strong> {{ now()->format('Y-m-d H:i') }}
    </div>
    <table>
        <thead>
            <tr>
                <th>Order ID</th>
                <th>Items</th>
                <th>Processed By</th>
                <th>Total</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($orders as $order)
                <tr>
                    <td>{{ $order->order_number }}</td>
                    <td>{{ $order->items->sum('quantity') }}</td>
                    <td>{{ $order->verifier ? $order->verifier->first_name . ' ' . $order->verifier->last_name : 'N/A' }}</td>
                    <td>PHP {{ number_format($order->total_amount, 2) }}</td>
                    <td>{{ $order->completed_at ? $order->completed_at->format('Y-m-d H:i') : 'N/A' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <div class="total">
        TOTAL: PHP {{ number_format($total_amount, 2) }}
    </div>
    <div class="footer">
        Generated automatically by PharmaDali.
    </div>
    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>
