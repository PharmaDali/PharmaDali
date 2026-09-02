const fs = require('fs');
const file = 'c:/Dev/PharmaDali/applications/pharmadali-admin/src/components/GetTechnicalHelp/ReportIssue.jsx';
let content = fs.readFileSync(file, 'utf8');
if (!content.includes('createTicket')) {
    content = content.replace('import React, { useState } from "react";', 'import React, { useState } from "react";\nimport { createTicket } from "../../services/ticketService";');
    fs.writeFileSync(file, content);
}