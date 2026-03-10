import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, FileText, MessageCircle } from "lucide-react";
import Logo from "../img/PRIMARY.png";
import BellIcon from "../img/Notification.png";
import UserIcon from "../img/Profile.png";
import { ProfileModal } from "../modals/ProfileModal";
import { NotificationModal } from "../modals/NotificationModal";
import { LogoutModal } from "../modals/LogoutModal";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: FileText, label: "Application Form", path: "/application-form" },
  { icon: MessageCircle, label: "AI Assistant", path: "/ai-assistant" },
];

type StoredUser = {
  id: number;
  firstName: string;
  lastName?: string;
  email?: string;
  role?: string;
};

function isLoggedIn() {
  const token = localStorage.getItem("scholarcheck_accessToken");
  const user = localStorage.getItem("scholarcheck_user");
  return !!token && !!user;
}

function getStoredUser(): StoredUser {
  const raw = localStorage.getItem("scholarcheck_user");

  if (!raw) {
    return { id: 0, firstName: "Student", lastName: "", email: "" };
  }

  try {
    const parsed = JSON.parse(raw);

    return {
      id: Number(parsed?.id ?? 0),
      firstName: String(parsed?.firstName ?? "Student"),
      lastName: String(parsed?.lastName ?? ""),
      email: String(parsed?.email ?? ""),
      role: String(parsed?.role ?? ""),
    };
  } catch {
    return { id: 0, firstName: "Student", lastName: "", email: "" };
  }
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const [user, setUser] = useState<StoredUser>(() => getStoredUser());

  const notifications = [
    "Profile update required\nPlease update your GPA information",
    "Scholarship payout scheduled next week",
    "New scholarship opportunity available",
  ];

  useEffect(() => {
    setUser(getStoredUser());

    const syncUser = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("storage", syncUser);
    window.addEventListener("focus", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("focus", syncUser);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) return;

    const pushGuard = () => {
      window.history.pushState({ __sc_lock: true }, "", window.location.href);
    };

    pushGuard();

    const onPopState = () => {
      navigate("/home", { replace: true });
      setProfileOpen(false);
      setNotificationOpen(false);
      setLogoutOpen(false);
      window.setTimeout(() => pushGuard(), 0);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [navigate]);

  const handleConfirmLogout = () => {
    localStorage.removeItem("scholarcheck_accessToken");
    localStorage.removeItem("scholarcheck_refreshToken");
    localStorage.removeItem("scholarcheck_user");
    setProfileOpen(false);
    setLogoutOpen(false);
    navigate("/login", { replace: true });
  };

  const handleViewProfile = () => {
    setProfileOpen(false);
    navigate("/profile");
  };

  const handleChangePassword = () => {
    setProfileOpen(false);
    navigate("/change-password");
  };

  const fullName = useMemo(() => {
    return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Student";
  }, [user.firstName, user.lastName]);

  const SIDEBAR_W = 270;
  const HEADER_H = 64;

  return (
    <div className="min-h-screen">
      {/* ===== SIDEBAR ===== */}
      <aside
        className="fixed top-0 left-0 h-full border-r border-gray-200 bg-white"
        style={{ width: SIDEBAR_W }}
      >
        <div className="flex h-full flex-col px-5 py-5">
          <div className="flex items-center gap-2 px-2">
            <img
              src={Logo}
              alt="ScholarCheck Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-[16px] font-semibold text-gray-900">
              ScholarCheck
            </span>
          </div>

          <nav className="mt-6 flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] transition",
                    isActive
                      ? "bg-emerald-100 text-emerald-900"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-emerald-700" : "text-gray-600"
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div style={{ marginLeft: SIDEBAR_W }}>
        <header
          className="fixed right-0 top-0 z-50 flex items-center justify-end border-b border-gray-200 bg-white px-6"
          style={{
            left: SIDEBAR_W,
            height: HEADER_H,
          }}
        >
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationOpen((v) => !v);
                  setProfileOpen(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-gray-100"
                type="button"
                aria-label="Open notifications"
              >
                <img src={BellIcon} alt="Notifications" className="h-5 w-5" />
              </button>

              <NotificationModal
                isOpen={notificationOpen}
                onClose={() => setNotificationOpen(false)}
                notifications={notifications}
              />
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setNotificationOpen(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-gray-100"
                type="button"
                aria-label="Open profile menu"
                title={fullName}
              >
                <img src={UserIcon} alt="Profile" className="h-5 w-5" />
              </button>

              <ProfileModal
                isOpen={profileOpen}
                onClose={() => setProfileOpen(false)}
                firstName={user.firstName}
                lastName={user.lastName || ""}
                email={user.email || ""}
                onViewProfile={handleViewProfile}
                onChangePassword={handleChangePassword}
                onLogout={() => {
                  setProfileOpen(false);
                  setLogoutOpen(true);
                }}
              />
            </div>
          </div>
        </header>

        <main
          className="min-h-screen bg-[#EAF7F1] px-8"
          style={{ paddingTop: HEADER_H + 18 }}
        >
          {children}
        </main>
      </div>

      <LogoutModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}