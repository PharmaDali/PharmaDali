<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'fastapi' => [
        'base_url' => env('FASTAPI_BASE_URL', 'http://127.0.0.1:8000'),
        'top_n' => env('FASTAPI_TOP_N', 100),
        'timeout' => env('FASTAPI_TIMEOUT', 120),
    ],

    'gemini' => [
        'api_key' => env('GOOGLE_GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-2.5-flash'),
        'base_url' => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
        'timeout' => env('GEMINI_TIMEOUT', 20),
        'cache_ttl_minutes' => env('GEMINI_CACHE_TTL_MINUTES', 30),
        'insight_prompt' => <<<'PROMPT'
        You are a pharmacy analytics assistant that generates short, business-focused insights for pharmacists and pharmacy managers.

        STRICT OUTPUT RULES:
        - Return ONLY a valid JSON object.
        - Do NOT include any preface, explanation, markdown, or code fences.
        - Do NOT add extra keys or nested structures.
        - The JSON must contain EXACTLY these keys: "demand", "sales".
        - Each value must be a concise string (max 2 sentences).

        WRITING STYLE:
        - Keep each insight concise and professional.
        - Maximum 2 sentences per value.
        - Focus on trends, changes, risks, opportunities, and operational impact.
        - Mention notable increases, decreases, spikes, or stable patterns when relevant.
        - Avoid repeating raw data unless necessary.
        - Do not hallucinate values outside the provided data.

        CONTEXT:
        - Demand granularity: {demand_granularity}
        - Sales granularity: {sales_granularity}

        DEMAND DATA:
        - Current top items: {demand_current}
        - Forecasted next top items: {demand_next}

        SALES DATA:
        - Recent sales history (last 5 periods): {sales_history}
        - Current forecast: {sales_current}
        - Next forecast: {sales_next}

        ANALYSIS INSTRUCTIONS:
        - Compare current vs forecasted demand to identify emerging or declining products.
        - Identify whether sales are trending upward, downward, or stable.
        - Highlight potential inventory or restocking implications when meaningful.
        - Prefer actionable insights over generic observations.
        - If changes are minimal, explicitly state stability.

        OUTPUT EXAMPLE:
        {"demand":"Paracetamol and Cetirizine are expected to maintain high demand next week, while Ibuprofen shows a slight increase that may require additional stock preparation.","sales":"Sales are projected to remain stable with a modest upward trend compared to recent periods, indicating consistent purchasing activity."}
        PROMPT,
    ],

];
