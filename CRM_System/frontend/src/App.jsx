
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('crm_token');
  return token ? children : <Navigate to="/login" replace />;
}

function DashboardPlaceholder() {
  return (
    <main className="placeholder-page">
      <h1>CRM Dashboard</h1>
      <p>Your login succeeded. We'll build the dashboard next.</p>
      <button
        onClick={() => {
          localStorage.removeItem('crm_token');
          window.location.href = '/login';
        }}
      >
        Log out
      </button>
    </main>
  );
}

function EnquiryPlaceholder() {
  return (
    <main className="placeholder-page">
      <h1>Student Enquiry</h1>
      <p>We'll add the public enquiry form in the next step.</p>
      <a href="/login">Counselor login</a>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPlaceholder />
            </ProtectedRoute>
          }
        />
        <Route path="/enquiry" element={<EnquiryPlaceholder />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
