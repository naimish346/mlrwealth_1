import { ArrowRight, Check, X, Clock } from "lucide-react";
import { Drawer } from "../../ui/drawer";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { useAppStore } from "../../../store/appStore";

export const MakerCheckerPanel = ({ isOpen, onClose, clientId }) => {
  const { getClientPendingChanges, approveChange, rejectChange, currentUser } =
    useAppStore();
  const changes = getClientPendingChanges(clientId);
  const isOpsUser =
    currentUser?.role === "Operations" || currentUser?.role === "Admin";

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Pending Changes" size="lg">
      <div className="space-y-4">
        {changes.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Check className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
            <p className="font-medium text-slate-500">No pending changes</p>
            <p className="text-sm">All changes have been processed.</p>
          </div>
        ) : (
          changes.map((change) => (
            <div
              key={change.id}
              className={`p-4 rounded-xl border ${
                change.status === "Pending"
                  ? "border-amber-200 bg-amber-50/50"
                  : change.status === "Approved"
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-red-200 bg-red-50/50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">
                  {change.fieldLabel}
                </span>
                <Badge
                  variant={
                    change.status === "Pending"
                      ? "warning"
                      : change.status === "Approved"
                        ? "success"
                        : "error"
                  }
                >
                  {change.status === "Pending" && (
                    <Clock className="w-3 h-3 mr-1" />
                  )}
                  {change.status}
                </Badge>
              </div>

              {/* Diff View */}
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-100">
                <div className="flex-1 text-center">
                  <p className="text-xs text-slate-400 mb-1">Old Value</p>
                  <p className="text-sm font-medium text-red-600 line-through">
                    {change.oldValue}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 shrink-0" />
                <div className="flex-1 text-center">
                  <p className="text-xs text-slate-400 mb-1">New Value</p>
                  <p className="text-sm font-medium text-emerald-600">
                    {change.newValue}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-slate-500">
                  <p>
                    Initiated by: <strong>{change.initiatedBy}</strong>
                  </p>
                  <p>
                    {new Date(change.initiatedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {change.status === "Pending" && isOpsUser && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectChange(change.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approveChange(change.id)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Drawer>
  );
};
