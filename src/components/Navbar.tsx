import { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import Avatar from '../assets/Avatar.png';

const TopNavbar = () => {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between bg-white shadow-md px-6 py-3 fixed top-0 left-0 right-0 z-50">
      <div
        className="text-2xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
        title="Go to home"
      >
        NWBE Test - Rafly Adriansyah
      </div>

      <div className="flex items-center space-x-4">
        {user?.role === "ADMIN" && (
          <>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              type="button"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              type="button"
            >
              Admin
            </button>
          </>
        )}

        <div className="relative">
          <button
            onClick={() => setProfileOpen(v => !v)}
            title={
              typeof user?.fullName === "string"
                ? user.fullName
                : typeof user?.email === "string"
                ? user.email
                : ""
            }
            className="flex items-center space-x-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 px-4 py-2 w-48 justify-center"
            type="button"
          >
            <span className="text-gray-800 font-medium">
              {typeof user?.fullName === "string"
                ? user.fullName
                : typeof user?.email === "string"
                ? user.email
                : ""}
            </span>
            <img
              src={
                typeof user?.profileImage === "string"
                  ? user.profileImage
                  : Avatar
              }
              alt="Profile"
              className="h-10 w-10 rounded-full object-cover"
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-[-1px] w-48 rounded-b-md border border-t-0 border-gray-300 bg-white shadow-lg z-50">
              <button
                onClick={() => {
                  logout();
                  setProfileOpen(false);
                }}
                className="block w-full px-4 py-2 text-left hover:bg-red-600 hover:text-white transition rounded-b-md"
                type="button"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
