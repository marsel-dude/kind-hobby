import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { AuthProvider } from './contexts/AuthContext';
import { AvatarProvider } from './contexts/AvatarContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useAuth } from './hooks/useAuth';

// Lazy load routes
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const ProfileSetup = React.lazy(() => import('./pages/ProfileSetup'));
const ProfileSuccess = React.lazy(() => import('./pages/ProfileSuccess'));
const Groups = React.lazy(() => import('./pages/Groups'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Events = React.lazy(() => import('./pages/Events'));
const Impact = React.lazy(() => import('./pages/Impact'));

// Lazy load admin routes
const AdminLayout = React.lazy(() => import('./components/admin/Layout').then(m => ({ default: m.AdminLayout })));
const AdminLogin = React.lazy(() => import('./pages/admin/Login'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = React.lazy(() => import('./pages/admin/Users'));
const AdminEvents = React.lazy(() => import('./pages/admin/Events'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AvatarProvider>
          <LanguageProvider>
            <Toaster position="top-center" />
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="events" element={<AdminEvents />} />
                  </Route>

                  {/* Main Routes */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="signup" element={<Signup />} />
                    <Route 
                      path="profile-setup" 
                      element={
                        <PrivateRoute>
                          <ProfileSetup />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="profile-success" 
                      element={
                        <PrivateRoute>
                          <ProfileSuccess />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="groups" 
                      element={
                        <PrivateRoute>
                          <Groups />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="profile" 
                      element={
                        <PrivateRoute>
                          <Profile />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="events" 
                      element={
                        <PrivateRoute>
                          <Events />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="impact" 
                      element={
                        <PrivateRoute>
                          <Impact />
                        </PrivateRoute>
                      } 
                    />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </LanguageProvider>
        </AvatarProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;