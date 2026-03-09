import { Routes, Route, Navigate } from "react-router-dom";
import { useAppStore } from "./store/appStore";
import { Layout } from "./components/layout/Layout";
import { LoginPage } from "./components/pages/LoginPage";
import { Dashboard } from "./components/modules/Dashboard";
import { Leads } from "./components/modules/Leads";
import { ClientOnboardingPage } from "./components/modules/client/ClientOnboardingPage";
import { ClientManagement } from "./components/modules/ClientManagement";
import { KYCCompliance } from "./components/modules/KYCCompliance";
import { RiskProfiling } from "./components/modules/RiskProfiling";
import { GoalPlanning } from "./components/modules/GoalPlanning";
import { Portfolio } from "./components/modules/Portfolio";
import { GlobalReminders } from "./components/modules/reminders/GlobalReminders";
import { Reports } from "./components/modules/Reports";
import { Settings } from "./components/modules/Settings";
import { Tasks } from "./components/modules/tasks/Tasks";
import { Toaster } from "sonner";

export function App() {
  const { isAuthenticated, activeModule } = useAppStore();

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Protected Routes */}
        {isAuthenticated ? (
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads/*" element={<Leads />} />
            <Route path="/reminders" element={<GlobalReminders />} />
            <Route path="/clients/*" element={<ClientManagement />} />
            <Route path="/tasks/*" element={<Tasks />} />
            <Route path="/kyc" element={<KYCCompliance />} />
            <Route path="/risk" element={<RiskProfiling />} />
            <Route path="/goals" element={<GoalPlanning />} />
            <Route path="/portfolio/*" element={<Portfolio />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}
