import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import SurveyStart from "./pages/SurveyStart.jsx";
import SurveyWizard from "./pages/SurveyWizard.jsx";
import SurveyResults from "./pages/SurveyResults.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminSurveys from "./pages/admin/AdminSurveys.jsx";
import AdminSurveyDetail from "./pages/admin/AdminSurveyDetail.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/survey" element={<SurveyStart />} />
      <Route path="/survey/:surveyId" element={<SurveyWizard />} />
      <Route path="/survey/results/:surveyId" element={<SurveyResults />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/surveys" element={<AdminSurveys />} />
      <Route path="/admin/surveys/:id" element={<AdminSurveyDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
