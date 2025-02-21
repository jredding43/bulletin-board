import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  doc, getDoc, setDoc, query, where, collection, onSnapshot, deleteDoc 
} from "firebase/firestore";
import { db } from "../firebaseConfig.ts";
import { useAuth } from "../context/AuthContext";
import { JobPost } from "../types";


interface WatchedJobsContextType {
  followedCards: JobPost[];
  toggleWatchJob: (jobId: string) => Promise<void>;
}

const WatchedJobsContext = createContext<WatchedJobsContextType | undefined>(undefined);

export const WatchedJobsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [followedCards, setFollowedCards] = useState<JobPost[]>([]);

  //  Firestore Real-time Listener for Watched Jobs
  useEffect(() => {
    if (!currentUser?.uid) return;

    const followedRef = collection(db, "followedCards");
    const followedQuery = query(followedRef, where("userId", "==", currentUser.uid));

    const unsubscribe = onSnapshot(followedQuery, async (snapshot) => {
      const watchedJobs: JobPost[] = [];

      for (const docSnap of snapshot.docs) {
        const jobData = docSnap.data();
        if (!jobData?.jobId) continue;

        const jobRef = doc(db, "jobCards", jobData.jobId);
        const jobSnap = await getDoc(jobRef);
        if (!jobSnap.exists()) {
          console.warn("Job not found, removing from followedCards:", jobData.jobId);
          await deleteDoc(doc(db, "followedCards", docSnap.id)); 
          continue;
        }

        const jobDetails = jobSnap.data() as JobPost;
        watchedJobs.push({
          id: jobData.jobId,
          jobId: jobData.jobId,
          profileId: jobData.profileId || "unknown-profile",
          jobTitle: jobDetails.jobTitle || "Untitled Job",
          companyName: jobDetails.companyName || "Unknown Company",
          jobDescription: jobDetails.jobDescription || "No description available",
          salary: jobDetails.salary ? String(jobDetails.salary) : undefined,
          hourly: jobDetails.hourly ? String(jobDetails.hourly) : undefined,
          employmentType: jobDetails.employmentType || "Unknown",
          jobLocation: jobDetails.jobLocation || "Location unknown",
          requiredSkills: jobDetails.requiredSkills || [],
          companyBenefits: jobDetails.companyBenefits || "No benefits listed",
          category: jobDetails.category || "Other",
          isFollowed: jobData.isFollowed ?? true,
        
        });
      }

      setFollowedCards(watchedJobs);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [currentUser]);

  //  Watch/Unwatch Job (Fully Synced with Firestore)
  const toggleWatchJob = async (jobId: string) => {
    if (!currentUser?.uid) return;
  
    try {
      const jobRef = doc(db, "followedCards", `${currentUser.uid}_${jobId}`);
      const docSnap = await getDoc(jobRef);
  
      if (docSnap.exists()) {
        //  Unfollow job by deleting from `followedCards`
        await deleteDoc(jobRef);
        setFollowedCards((prev) => prev.filter((job) => job.id !== jobId));
      } else {
        //  Follow job by adding to `followedCards`
        await setDoc(jobRef, {
          userId: currentUser.uid,
          jobId: jobId,
          followedAt: new Date().toISOString(),
        });
  
        // Fetch job details from `jobCards` collection
        const jobSnap = await getDoc(doc(db, "jobCards", jobId));
        if (!jobSnap.exists()) return;
  
        const jobDetails = jobSnap.data() as JobPost;
  
        setFollowedCards((prev) => {
          if (prev.some((job) => job.id === jobId)) return prev;
          return [
            ...prev,
            {
              id: jobId,
              jobId: jobId,
              profileId: jobDetails.profileId || "unknown-profile", // Ensure it's defined
              jobTitle: jobDetails.jobTitle || "Untitled Job",
              companyName: jobDetails.companyName || "Unknown Company",
              jobDescription: jobDetails.jobDescription || "No description available",
              salary: jobDetails.salary ? String(jobDetails.salary) : undefined,
              hourly: jobDetails.hourly ? String(jobDetails.hourly) : undefined,
              employmentType: jobDetails.employmentType || "Unknown",
              jobLocation: jobDetails.jobLocation || "Location unknown",
              requiredSkills: jobDetails.requiredSkills || [],
              category: jobDetails.category || "Other",
              companyBenefits: jobDetails.companyBenefits || "No benefits listed",
              isFollowed: true,
            },
          ];
        });        
      }
    } catch (error) {
      console.error("🔥 Error toggling watch status:", error);
    }
  };
  
  
  
  return (
    <WatchedJobsContext.Provider value={{ followedCards, toggleWatchJob }}>
      {children}
    </WatchedJobsContext.Provider>
  );
};

// Custom Hook for Accessing the Context
export const useWatchedJobs = () => {
  const context = useContext(WatchedJobsContext);
  if (!context) throw new Error("useWatchedJobs must be used within a WatchedJobsProvider");
  return context;
};
