import React, { useState } from "react";
import "../assets/css/get-technical-help.css";
import GetTechnicalHelpHome from "../components/GetTechnicalHelp/GetTechnicalHelpHome";
import ReportIssue from "../components/GetTechnicalHelp/ReportIssue";
import UserManual from "../components/GetTechnicalHelp/UserManual";

function GetTechnicalHelp() {
    const [view, setView] = useState("home"); // "home" | "contact" | "manual"

    if (view === "manual") {
        return <UserManual setView={setView} />;
    }

    if (view === "contact") {
        return <ReportIssue setView={setView} />;
    }

    return <GetTechnicalHelpHome setView={setView} />;
}

export default GetTechnicalHelp;
