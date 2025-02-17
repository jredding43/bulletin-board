import React, { useEffect, useState } from "react";
import { doc, collection, query, where, getDocs, deleteDoc, getDoc} from "firebase/firestore";
import { db } from "../firebaseConfig.ts";
import EditJobModal from "./EditJobModal.tsx";
import JobDetailsModal from "../components/JobDetailModal.tsx";
import { FaBriefcase, FaChevronDown, FaChevronUp, FaEdit, FaTrash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.tsx";
import { JobPost } from "../types";
import { useWatchedJobs } from "..//components/WatchedJobsContext.tsx";

interface UserInsightProps {
  userId: string;
}

const UserInsights: React.FC<UserInsightProps> = ({ userId }) => {
  const [activeJobs, setActiveJobs] = useState<JobPost[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [watchedJobsOpen, setWatchedJobsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);

  const { currentUser } = useAuth();
  const [selectedCard, setSelectedCard] = useState<JobPost | null>(null);

  const { followedCards, toggleWatchJob } = useWatchedJobs();
  


 // Fetch Active Job Postings (User's Created Jobs)
 useEffect(() => {
  const fetchActiveJobs = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const jobsRef = collection(db, "jobCards");
      const jobsQuery = query(jobsRef, where("creatorId", "==", userId));
      const jobsSnapshot = await getDocs(jobsQuery);

      const jobs = jobsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as JobPost[];

      setActiveJobs(jobs);
    } catch (error) {
      console.error("Error fetching active job postings:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchActiveJobs();
}, [userId]);

// Fetch Followed Job Cards (Watched Jobs)
useEffect(() => {
  const fetchFollowedCards = async () => {
    setLoading(true);
    try {
      if (!currentUser?.uid) return;

      console.log("Fetching watched jobs for:", currentUser.uid);

      const followedRef = collection(db, "followedCards");
      const followedQuery = query(followedRef, where("userId", "==", currentUser.uid));

      const followedSnapshot = await getDocs(followedQuery);
      console.log("Followed jobs found:", followedSnapshot.docs.length);

      const followedJobs: JobPost[] = [];

      for (const docSnap of followedSnapshot.docs) {
        const jobData = docSnap.data();

        const jobId = jobData?.jobId || jobData?.cardId;
        if (!jobId) {
          console.warn("Missing jobId in followed job:", jobData);
          continue;
        }

        const jobRef = doc(db, "jobCards", jobId);
        const jobSnap = await getDoc(jobRef);

        if (!jobSnap.exists()) {
          console.warn("Job not found in jobCards, removing from followed:", jobId);
          await deleteDoc(doc(db, "followedCards", docSnap.id)); // ❌ Auto-remove orphaned job
          continue;
        }

        const jobDetails = jobSnap.data() as JobPost;

        const formattedJob: JobPost = {
          id: jobId,
          jobTitle: jobDetails.jobTitle || "Untitled Job",
          companyName: jobDetails.companyName || "Unknown Company",
          jobDescription: jobDetails.jobDescription || "No description available",
          salary: jobDetails.salary ? String(jobDetails.salary) : undefined,
          hourly: jobDetails.hourly ? String(jobDetails.hourly) : undefined,
          employmentType: jobDetails.employmentType || "Unknown",
          jobLocation: jobDetails.jobLocation || "Location unknown",
          requiredSkills: jobDetails.requiredSkills || [],
          companyBenefits: jobDetails.companyBenefits || "No benefits listed",
          isFollowed: jobData.isFollowed ?? true,
          category: "",
        };

        followedJobs.push(formattedJob);
      }

      // 🔥 FIX: Use `useWatchedJobs()` context to update followed jobs
      console.log("Updated watched jobs:", followedJobs);
    } catch (error) {
      console.error("Error fetching followed jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchFollowedCards();
}, [currentUser]);


// Fetch Active Job Postings (User's Created Jobs)
useEffect(() => {
  const fetchActiveJobs = async () => {
    setLoading(true); //  Set loading before fetching
    try {
      if (!currentUser?.uid) return;

      const jobsRef = collection(db, "jobCards");
      const jobsQuery = query(jobsRef, where("creatorId", "==", currentUser.uid));
      const jobsSnapshot = await getDocs(jobsQuery);

      const jobs = jobsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as JobPost[];

      setActiveJobs(jobs);
    } catch (error) {
      console.error("Error fetching active job postings:", error);
    } finally {
      setLoading(false); // Ensure loading is set to false after fetching
    }
  };

  fetchActiveJobs();
}, [currentUser]);


const handleDeleteJob = async (jobId: string) => {
  try {
    await deleteDoc(doc(db, "jobCards", jobId));
    setActiveJobs((prev) => prev.filter((job) => job.id !== jobId));
  } catch (error) {
    console.error("Error deleting job:", error);
  }
};

return (
  <div className="bg-white p-6 shadow-lg rounded-lg max-w-3xl mx-auto border border-gray-300">
    <div className="mt-8 p-4 bg-white border border-black rounded-lg shadow-md text-center">
      <h3 className="text-2xl font-bold text-black flex items-center justify-center">
        Active Card Postings
      </h3>
      <p className="text-green-700 text-lg mt-2">
        You have <strong>{activeJobs.length}</strong> active job postings.
      </p>

      <button
        className="w-full flex justify-center items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {dropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
        {dropdownOpen ? "Hide Active Jobs" : "View Active Jobs"}
      </button> 
    </div>

    {/* Active Jobs */}
    {dropdownOpen && (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-md max-h-[500px] overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-500 italic">Loading jobs...</p>
        ) : activeJobs.length === 0 ? (
          <p className="text-gray-600 text-center italic">You have no active job postings.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 bg-white rounded-lg border border-gray-300 shadow-md flex flex-col justify-between"
              >
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <FaBriefcase className="mr-2 text-green-600" /> {job.jobTitle}
                </h3>
                <p className="text-gray-700"><strong>Company:</strong> {job.companyName}</p>
                <p className="text-gray-700"><strong>Location:</strong> {job.jobLocation}</p>
                <p className="text-gray-700">
                  <strong>Compensation:</strong> {job.salary ? `Salary: ${job.salary}` : job.hourly ? `Hourly: ${job.hourly}` : "Not listed"}
                </p>

                <div className="flex justify-between mt-4">
                  <button
                    className="bg-yellow-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all flex-1 flex items-center justify-center"
                    onClick={() => setSelectedJob(job)}
                  >
                    <FaEdit className="mr-1" /> Edit
                  </button>

                  <button
                    className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 transition-all flex-1 flex items-center justify-center"
                    onClick={() => handleDeleteJob(job.id)}
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {selectedJob && (
      <EditJobModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onSave={(updatedJob) => {
          setActiveJobs((prev) =>
            prev.map((job) => (job.id === updatedJob.id ? updatedJob : job))
          );
        }}
      />
    )}

    {/* Followed Jobs Section */}
    <div className="mt-8 p-1 bg-white border border-gray-300 rounded-lg shadow-md">
    <div className="mt-8 p-4 bg-white border border-black rounded-lg shadow-md text-center">
      <h3 className="text-2xl font-bold text-black flex items-center justify-center">
        Card Watching
      </h3>

      <button
        className="w-full flex justify-center items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
        onClick={() => setWatchedJobsOpen(!watchedJobsOpen)}
      >
        {watchedJobsOpen ? <FaChevronUp /> : <FaChevronDown />}
        {watchedJobsOpen ? "Hide Watched Jobs" : "View Watched Jobs"}
      </button>

      {watchedJobsOpen && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-md max-h-[500px] overflow-y-auto">
          {followedCards.length === 0 ? (
            <p className="text-gray-600 text-center italic">You are not watching any job cards yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {followedCards.map((card) => (
                <div key={card.id} className="p-4 bg-white rounded-lg border border-gray-300 shadow-md flex flex-col justify-between">
                  <h3 className="text-lg font-bold text-gray-800">{card.jobTitle}</h3>
                  <h3 className="text-lg font-bold text-gray-800"><hr className="border-t border-gray-300 my-2" /></h3>
                  <p className="text-gray-700"><strong>Company:</strong> {card.companyName}</p>
                  <p className="text-gray-700"><strong>Salary/Hourly:</strong>{" "}
                    {card.salary
                      ? `Salary: $${card.salary}`
                      : card.hourly
                      ? `Hourly: $${card.hourly}/hr`
                      : "Not specified"}
                  </p>
                  <p className="text-gray-700"><strong>Location:</strong> {card.jobLocation}</p>
                  <p className="text-gray-700"><strong>Employment Type:</strong> {card.employmentType}</p>


                  <button onClick={() => toggleWatchJob(card.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg mb-2 mt-5">
                    {card.isFollowed ? "Unwatch" : "Watch"}
                  </button>
                  <button onClick={() => setSelectedCard(card)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                     View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    </div>

    {selectedCard && <JobDetailsModal selectedJob={selectedCard} onClose={() => setSelectedCard(null)} />}
  </div>
);
};

export default UserInsights;