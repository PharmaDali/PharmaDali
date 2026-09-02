const fs = require('fs');
const file = 'c:/Dev/PharmaDali/applications/pharmadali-admin/src/components/GetTechnicalHelp/ReportIssue.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldFuncRegex = /const handleReportSubmit = async? \(e\) => \{[\s\S]*?setShowSuccessModal\(true\);\s*\};/;
const newFunc = `const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!issueSummary.trim() || !issueProblem.trim()) return;

        // Generate Ticket Reference ID
        const refId = "TICK-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
        setTicketRefId(refId);

        try {
            // Fetch logged in user email if available
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed.email) setUserEmail(parsed.email);
            }
            
            const payload = {
                title: issueSummary,
                category: issueCategory || "technical",
                priority: issuePriority || "medium",
                description: issueProblem,
                steps_taken: issueSteps ? issueSteps.split('\\n').filter(s => s.trim()) : [],
            };
            
            const res = await createTicket(payload);
            setTicketRefId(res?.id ? ('#' + res.id) : refId);
            setShowSuccessModal(true);
        } catch (err) {
            console.error(err);
            alert("Error submitting ticket");
        }
    };`;

content = content.replace(oldFuncRegex, newFunc);
fs.writeFileSync(file, content);