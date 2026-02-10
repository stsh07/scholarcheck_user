import { Link, useLocation } from "react-router-dom";
import { Home, FileText, MessageCircle, LogOut } from "lucide-react";
import Logo from "../img/PRIMARY.png";
import BellIcon from "../img/Notification.png";
import UserIcon from "../img/Profile.png";

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

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="flex">
      {/* ===== SIDEBAR ===== */}
      <aside className="fixed top-0 left-0 h-full w-[280px] border-r border-gray-200 flex flex-col bg-white">
        {/* Logo / Nav Links */}
        <div className="flex flex-col flex-1 p-6 overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <img
              src={Logo}
              alt="ScholarCheck Logo"
              className="object-contain w-8 h-8 md:w-10 md:h-10"
            />
            <span className="text-xl font-semibold text-gray-900">ScholarCheck</span>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 text-lg",
                    isActive
                      ? "bg-green-800 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto">
            <button
              onClick={() => {
                const confirmed = window.confirm("Are you sure you want to logout?");
                if (confirmed) {
                  console.log("User logged out");
                  window.location.href = "/login";
                }
              }}
              className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 transition-colors duration-200 rounded-lg hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 ml-[280px] flex flex-col">
        {/* ===== HEADER ===== */}
        <header className="fixed top-0 left-[280px] right-0 z-50 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-300">
          <div></div> {/* Empty div, header title is in sidebar */}
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center w-10 h-10 bg-white border border-white rounded-full hover:bg-gray-100">
              <img src={BellIcon} alt="Notifications" className="w-5 h-5" />
            </button>
            <button className="flex items-center justify-center w-10 h-10 bg-white border border-white rounded-full hover:bg-gray-100">
              <img src={UserIcon} alt="Profile" className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ===== CONTENT ===== */}
        <main className="mt-[72px] p-8 bg-gray-50 min-h-screen">{children}</main>

      </div>
    </div>
  );
}
