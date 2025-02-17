import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig.ts";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import { AuthProvider } from "./context/AuthContext"; 
import { WatchedJobsProvider } from "./components/WatchedJobsContext.tsx";

const App: React.FC = () => {
  useEffect(() => {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && !userDoc.data().verified) {
          await updateDoc(userRef, { verified: true });
          console.log("User verified and updated in Firestore!");
        }
      }
    });
  }, []);

  return (
    
    <AuthProvider>
      <WatchedJobsProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Router>
      </WatchedJobsProvider>
    </AuthProvider>
  );
};

export default App;
