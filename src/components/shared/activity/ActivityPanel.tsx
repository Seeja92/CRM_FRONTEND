"use client";

import { useState } from "react";
import { Box, Tabs, Tab, Divider } from "@mui/material";
import NoteList from "./notes/NoteList";
import EmailList from "./emails/EmailList";
import CallList from "./calls/CallList";
import TaskList from "./tasks/TaskList";
import MeetingList from "./meetings/MeetingList";

interface ActivityPanelProps {
  entityId: number;
  entityType: "lead" | "deal" | "ticket" | "company";
  entity: any;
  activeTab?: number;
  onTabChange?: (tab: number) => void;
  activityContent?: React.ReactNode;
  onTaskComplete?: () => void;
  onLogCall?: () => void;
}
const activityColors: Record<string, string> = {
  Task: "#6c63ff",
  Call: "#4caf50",
  Meeting: "#2196f3",
  Email: "#ff9800",
  Note: "#9c27b0",
};

export default function ActivityPanel({
  entityId,
  entityType,
  entity,
  activeTab: externalTab,
  onTabChange,
  activityContent,
  onTaskComplete,
  onLogCall,
}: ActivityPanelProps) {
  const [internalTab, setInternalTab] = useState(0);

  const activeTab = externalTab !== undefined ? externalTab : internalTab;
  const setActiveTab = (val: number) => {
    setInternalTab(val);
    onTabChange?.(val);
  };

  const tabs = ["Activity", "Notes", "Emails", "Calls", "Tasks", "Meetings"];

  return (
    <Box>
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          mb: 2,
          "& .MuiTab-root": {
            textTransform: "none",
            fontSize: 13,
            minWidth: "auto",
            px: 1.5,
          },
          "& .Mui-selected": { color: "#6c63ff !important" },
          "& .MuiTabs-indicator": { bgcolor: "#6c63ff" },
        }}
      >
        {tabs.map((tab) => (
          <Tab key={tab} label={tab} />
        ))}
      </Tabs>

      <Divider sx={{ mb: 2 }} />

      {activeTab === 0 && activityContent}

      {activeTab === 1 && <NoteList entity={entity} entityType={entityType} />}
      {activeTab === 2 && <EmailList entity={entity} entityType={entityType} />}
      {activeTab === 3 && <CallList entity={entity} entityType={entityType} />}
      {activeTab === 4 && (
        <TaskList
          entity={entity}
          entityType={entityType}
          onTaskComplete={onTaskComplete}
        />
      )}
      {activeTab === 5 && (
        <MeetingList entity={entity} entityType={entityType} lead={entity}/>
      )}
    </Box>
  );
}
