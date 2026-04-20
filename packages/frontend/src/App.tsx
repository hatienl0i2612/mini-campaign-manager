import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CampaignListPage } from './pages/CampaignListPage';
import { CampaignNewPage } from './pages/CampaignNewPage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';

export function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes (wrapped in Layout) */}
            <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/campaigns" replace />} />
                <Route path="campaigns" element={<CampaignListPage />} />
                <Route path="campaigns/new" element={<CampaignNewPage />} />
                <Route path="campaigns/:id" element={<CampaignDetailPage />} />
            </Route>
        </Routes>
    );
}
