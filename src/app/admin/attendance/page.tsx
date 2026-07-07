import { AttendanceDashboard } from "@/components/attendance/attendance-dashboard";

export default function AdminAttendancePage() {
  return (
    <AttendanceDashboard
      mode="admin"
      title="Attendance Management"
      description="Recorded automatically when students join class from the portal. Present on time, Late after 10 minutes."
    />
  );
}
