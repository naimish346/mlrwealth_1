import React from "react";
import { cn } from "../../../utils/cn";
import { TaskList } from "./TaskList";
import { TaskKanban } from "./TaskKanban";

export const TaskDashboard = ({ viewMode }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      {viewMode === "list" ? <TaskList /> : <TaskKanban />}
    </div>
  );
};
