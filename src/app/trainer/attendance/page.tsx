import { AttendanceDashboard } from "@/components/attendance/attendance-dashboard";

export default function TrainerAttendancePage() {
  return (
    <AttendanceDashboard
      mode="trainer"
      title="Class Attendance"
      description="Track who joined your live classes — day-wise, module-wise, and per session."
    />
  );
}
