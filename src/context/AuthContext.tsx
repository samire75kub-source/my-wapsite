import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserPlan } from '../types';
import { useRealtime } from './RealtimeContext';

interface AuthContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  usersList: User[];
  switchUser: (userId: string) => void;
  isAdminLoggedIn: boolean;
  adminToken: string | null;
  adminRole: string | null;
  loginAdmin: (token: string, role: string) => void;
  logoutAdmin: () => void;
  isPaywallOpen: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  isPaymentModalOpen: boolean;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  isAdminLoginOpen: boolean;
  openAdminLogin: () => void;
  closeAdminLogin: () => void;
  checkQuota: (storageNeededKb?: number) => boolean;
  refreshUsers: () => void;
}

const DEFAULT_CURRENT_USER: User = {
  id: 'usr_guest',
  username: 'tanvir_bd',
  email: 'tanvir@gmail.com',
  role: 'user',
  plan: 'free',
  storageUsedKb: 450,
  storageLimitKb: 51200, // 50MB
  projectsCount: 1,
  projectsLimit: 5,
  isBlacklisted: false,
  createdAt: '2026-10-01T08:15:00.000Z'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { refreshTrigger, addToast } = useRealtime();
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_CURRENT_USER);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<string | null>(null);

  // Modals
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const refreshUsers = useCallback(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then((users: User[]) => {
        if (Array.isArray(users) && users.length > 0) {
          setUsersList(users);
          // Sync current user state
          setCurrentUser(prev => {
            const found = users.find(u => u.id === prev.id || u.username === prev.username);
            return found || prev;
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers, refreshTrigger]);

  const switchUser = (userId: string) => {
    const target = usersList.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      addToast({
        type: 'info',
        title: 'Switched User Profile',
        description: `Now active as ${target.username} (${target.plan.toUpperCase()} Plan)`
      });
    }
  };

  const loginAdmin = (token: string, role: string) => {
    setIsAdminLoggedIn(true);
    setAdminToken(token);
    setAdminRole(role);
    setIsAdminLoginOpen(false);
    addToast({
      type: 'success',
      title: 'Admin Session Authenticated',
      description: 'Master Control Center unlocked with 2FA integrity clearance.'
    });
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setAdminToken(null);
    setAdminRole(null);
    addToast({
      type: 'info',
      title: 'Admin Session Terminated',
      description: 'Returned to public user state.'
    });
  };

  const checkQuota = (storageNeededKb = 100): boolean => {
    if (currentUser.plan !== 'free') return true;

    if (currentUser.projectsCount >= currentUser.projectsLimit) {
      setIsPaywallOpen(true);
      return false;
    }

    if (currentUser.storageUsedKb + storageNeededKb > currentUser.storageLimitKb) {
      setIsPaywallOpen(true);
      return false;
    }

    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        usersList,
        switchUser,
        isAdminLoggedIn,
        adminToken,
        adminRole,
        loginAdmin,
        logoutAdmin,
        isPaywallOpen,
        openPaywall: () => setIsPaywallOpen(true),
        closePaywall: () => setIsPaywallOpen(false),
        isPaymentModalOpen,
        openPaymentModal: () => setIsPaymentModalOpen(true),
        closePaymentModal: () => setIsPaymentModalOpen(false),
        isAdminLoginOpen,
        openAdminLogin: () => setIsAdminLoginOpen(true),
        closeAdminLogin: () => setIsAdminLoginOpen(false),
        checkQuota,
        refreshUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
