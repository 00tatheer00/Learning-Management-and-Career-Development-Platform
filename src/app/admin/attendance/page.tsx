import { AttendanceDashboard } from "@/components/attendance/attendance-dashboard";
import { lateThresholdDescription, ATTENDANCE_TRACKING_START_DATE } from "@/lib/constants/attendance";

export default function AdminAttendancePage() {
  return (
    <AttendanceDashboard
      mode="admin"
      title="Attendance Management"
      description={`Recorded when students join class from the portal (from ${ATTENDANCE_TRACKING_START_DATE}). Present on time, ${lateThresholdDescription()}.`}
    />
  );
}
