import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import SubheaderOne from "../components/SubheaderOne";
import UserProfile from "../components/UserProfile";
import UserInsights from "../components/UserInsights";
import CreateJobCard from "../components/CreateJobCard";
import BuildJobCard from "../components/BuildProfileCard";
import MainContent from "../components/MainContent";
import FilterModal from "../components/FilterModal.tsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig.ts";
import jobCategories from "../data/jobCategories.json";


const Home: React.FC = () => {
    const [isAsideOpen, setIsAsideOpen] = useState(false);
    const [activeAsideContent, setActiveAsideContent] = useState<"default" | "userProfile" | "userInsight" | "createJobCard" | "buildJobCard">("default");
    const [currentUser, setCurrentUser] = useState<{ uid: string; email: string } | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState<{ employmentType?: string; location?: string; salary?: string; company?: string }>({});

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser({ uid: user.uid, email: user.email || "" });

                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();

                    // Ensure certs are an array of strings
                    const formattedCerts = Array.isArray(data.certs)
                        ? data.certs.map(cert => (typeof cert === "string" ? cert : cert.Certification || "Unknown"))
                        : [];

                    setUserData({ ...data, certs: formattedCerts }); 
                }
            } else {
                setCurrentUser(null);
                setUserData(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const toggleAside = () => setIsAsideOpen(prev => !prev);

    const showAside = (content: "default" | "userProfile" | "userInsight" | "createJobCard" | "buildJobCard") => {
        setIsAsideOpen(true);
        setActiveAsideContent(content);
    };

    const handleApplyFilter = (newFilters: { 
        employmentType?: string; 
        location?: string; 
        salary?: string; 
        company?: string; 
        category?: string; 
        jobTitles?: string[]; 
    }) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            ...newFilters,
            jobTitles: newFilters.category && jobCategories[newFilters.category as keyof typeof jobCategories]
                ? jobCategories[newFilters.category as keyof typeof jobCategories]
                : [],
        }));
    };

    return (
        <div className="grid grid-rows-12 grid-cols-10 h-screen">
            {/* Header */}
            <header className="row-span-2 col-span-10 bg-gray-200">
                <Header />
            </header>

            {/* Subheaders */}
            <div className="row-span-2 col-span-4 bg-white border-r">
                <SubheaderOne 
                    onUserProfileClick={() => showAside("userProfile")} 
                    onUserInsightClick={() => showAside("userInsight")}
                    onCreateJobCardClick={() => showAside("createJobCard")}
                    onBuildJobCard={() => showAside("buildJobCard")}
                />
            </div>
            <div className="row-span-2 col-span-6 bg-gray-800 text-black flex items-center justify-center">
                <h1>Subheader 2</h1>
            </div>

            {/* Control Hub Section */}
            <div className="row-span-1 col-span-10 bg-cyan-500 text-black p-4 flex justify-left">
                <button onClick={() => setIsFilterModalOpen(true)} 
                    className="bg-white text-black px-4 py-2 rounded hover:bg-emerald-400 hover:border-emerald-400 transition-all m-1">
                    Open Filters
                </button>

                {/* ✅ Filter Modal - This was missing */}
                {isFilterModalOpen && (
                    <FilterModal
                        isOpen={isFilterModalOpen}
                        onClose={() => setIsFilterModalOpen(false)}
                        onApplyFilter={handleApplyFilter}
                    />
                )}
            </div>

            {/* Main Layout */}
            <div className="row-span-7 col-span-10 grid grid-cols-10">
                {/* Sidebar (Collapsible) */}
                {isAsideOpen && (
                    <aside className="col-span-4 bg-gray-800 text-black p-4 transition-all border-r relative">
                        <button onClick={toggleAside}
                            className="absolute top-2 right-2 bg-emerald-400 text-black px-4 py-2 rounded">
                            Close Sidebar
                        </button>

                        <div className="mt-10">
                            {currentUser ? (
                                activeAsideContent === "userProfile" ? (
                                    <UserProfile userId={currentUser.uid} />
                                ) : activeAsideContent === "userInsight" ? (
                                    <UserInsights userId={currentUser.uid} />
                                ) : activeAsideContent === "createJobCard" ? (
                                    <CreateJobCard />
                                ) : activeAsideContent === "buildJobCard" ? (
                                    userData ? <BuildJobCard userData={userData} /> : <p>Loading Profile...</p>
                                ) : (
                                    <p>Aside Content</p>
                                )
                            ) : (
                                <p>Loading user data...</p>
                            )}
                        </div>
                    </aside>
                )}

                {/* Main Content */}
                <main className={`bg-gray-800 text-black p-4 transition-all ${isAsideOpen ? "col-span-6" : "col-span-10"}`}>
                    <MainContent isAsideOpen={isAsideOpen} filters={filters} /> 
                </main>
            </div>
        </div>
    );
};

export default Home;
