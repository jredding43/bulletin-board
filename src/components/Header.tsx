import React from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebaseConfig.ts";
import BulletinBoard from "../assets/BulletinBoard.png";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const Header: React.FC = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      // Unsubscribe from Firestore listeners (if any)
      const messagesRef = collection(db, "messages");
      const q = query(messagesRef, where("receiverId", "==", auth.currentUser?.uid));
      const unsubscribe = onSnapshot(q, () => {}); // Empty listener to trigger unsubscribe
      unsubscribe(); // Call unsubscribe immediately

      await signOut(auth);

      console.log("✅ Successfully logged out");

      // Only navigate if the user is not already on the home page
      if (location.pathname !== "/") {
        navigate("/");
      }
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  return (
    <header className="grid grid-rows-3 grid-cols-10 text-black w-full h-full px-3 bg-cyan-500">
      {/* Title - Positioned in the first 3 columns and centered */}
      <h1 className="text-5xl font-bold col-span-4 row-start-2 flex justify-center items-center">
        The Bulletin Board
        <img src={BulletinBoard} alt="Bulletin Board" className="w-24 h-24" />
      </h1>

      {/* Logout Button - Positioned at the very end in column 10 */}
      <button
        className="col-start-10 row-start-2 bg-red-500 text-black px-6 py-3 rounded hover:bg-red-600 transition justify-self-end flex items-center justify-center text-center h-full"
        onClick={handleLogout}
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
