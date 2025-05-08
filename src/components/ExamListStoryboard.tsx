import ExamList from "./ExamList";
import { AuthProvider } from "@/lib/AuthContext";

export default function ExamListStoryboard() {
  return (
    <div className="bg-white p-6">
      <AuthProvider>
        <ExamList />
      </AuthProvider>
    </div>
  );
}
