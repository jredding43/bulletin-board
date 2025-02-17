import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig.ts";
import { FaBriefcase } from "react-icons/fa";
import JobDetailsModal from "../components/JobDetailModal.tsx";
import { JobPost } from "../types";
import { useWatchedJobs } from "../components/WatchedJobsContext.tsx";
import jobCategories from "../data/jobCategories.json";

interface MainContentProps {
  isAsideOpen: boolean;
  filters: { 
    employmentType?: string; 
    location?: string; 
    minSalary?: string; 
    maxSalary?: string;
    company?: string; 
    category?: string; 
    jobTitles?: string[];
    keyword?: string;
  };
}

const MainContent: React.FC<MainContentProps> = ({ isAsideOpen, filters }) => {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const { followedCards, toggleWatchJob } = useWatchedJobs();

  // ✅ Fetch Jobs From Firestore
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const jobCollection = collection(db, "jobCards");
        const jobQuery = query(jobCollection, orderBy("createdAt", "desc"));
        const jobSnapshot = await getDocs(jobQuery);

        console.log("🔥 Total Jobs Fetched:", jobSnapshot.docs.length);

        if (jobSnapshot.empty) {
          console.warn("❌ No job posts found in Firestore.");
        }

        const jobList = jobSnapshot.docs.map((doc) => ({
          id: doc.id,
          jobTitle: doc.data().jobTitle || "No Title",
          companyName: doc.data().companyName || "Unknown Company",
          jobLocation: doc.data().jobLocation || "Location not provided",
          salary: doc.data().salary || "Not Provided",
          hourly: doc.data().hourly || "",
          employmentType: doc.data().employmentType || "Not specified",
          requiredSkills: doc.data().requiredSkills || [],
          jobDescription: doc.data().jobDescription || "No description available",
          category: doc.data().jobCategory || "Other",
          timestamp: doc.data().createdAt || null,
        }));

        setJobPosts(jobList);
      } catch (error) {
        console.error("🔥 Firestore Error: Failed to fetch job posts.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // ✅ Filter Jobs Based on User Input
  useEffect(() => {
    let filtered = [...jobPosts];

    console.log("Original Jobs:", jobPosts);
    console.log("Applied Filters:", filters);

    // ✅ Ensure the selected category filters the correct jobs
    if (filters.category) {
      const categoryObj = jobCategories.find(
        (cat) => cat.category.toLowerCase() === filters.category!.toLowerCase()
      );

      if (categoryObj) {
        const categoryJobs = categoryObj.jobs;
        filtered = filtered.filter(
          (job) =>
            categoryJobs.includes(job.jobTitle) ||
            job.category.toLowerCase() === filters.category!.toLowerCase()
        );
      }
    }

    // ✅ Keyword-based filtering
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter((job) =>
        job.jobTitle.toLowerCase().includes(keyword) ||
        job.companyName.toLowerCase().includes(keyword) ||
        job.jobDescription.toLowerCase().includes(keyword)
      );
    }

    // ✅ Other filters
    filtered = filtered.filter((job) => {
      const jobSalary = job.salary ? parseFloat(job.salary.replace(/[^0-9.]/g, "")) : undefined;
      const minSalary = filters.minSalary ? parseFloat(filters.minSalary) : undefined;
      const maxSalary = filters.maxSalary ? parseFloat(filters.maxSalary) : undefined;

      return (
        (!filters.employmentType || job.employmentType?.toLowerCase() === filters.employmentType.toLowerCase()) &&
        (!filters.location || (job.jobLocation && job.jobLocation.toLowerCase().includes(filters.location.toLowerCase()))) &&
        (!minSalary || (jobSalary !== undefined && jobSalary >= minSalary)) &&
        (!maxSalary || (jobSalary !== undefined && jobSalary <= maxSalary)) &&
        (!filters.company || (job.companyName && job.companyName.toLowerCase().includes(filters.company.toLowerCase())))
      );
    });

    console.log("Filtered Jobs After Processing:", filtered);
    setFilteredJobs(filtered);
  }, [filters, jobPosts]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg w-full transition-all duration-300">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">🏢 Job Listings</h2>

      {loading ? (
        <p className="text-center text-gray-600 text-lg">Loading job listings...</p>
      ) : filteredJobs.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No job listings available.</p>
      ) : (
        <div
          className={`grid ${
            isAsideOpen ? "grid-cols-3" : "grid-cols-6"
          } gap-2 transition-all duration-300`}
        >
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-4 rounded-lg shadow-md border border-gray-300 hover:shadow-lg transition-all w-[250px] h-[350px] flex flex-col justify-between"
            >
              {/* Job Title */}
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold text-gray-800 flex items-center">
                  <FaBriefcase className="mr-2 text-blue-500" /> {job.jobTitle}
                </h3>
              </div>

              {/* Job Details */}
              <div className="flex-1 space-y-2 text-gray-700 mt-2 text-xs">
                <p><span className="text-gray-500">🏢 Company:</span> {job.companyName}</p>
                <p><span className="text-gray-500">💰 Pay:</span> {job.salary ? `$${job.salary}/yr` : job.hourly ? `$${job.hourly}/hr` : "Not specified"}</p>
                <p><span className="text-gray-500">🕒 Type:</span> {job.employmentType}</p>
                {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
                  <p><span className="text-gray-500">🛠 Skills:</span> {job.requiredSkills.slice(0, 3).join(", ")}{job.requiredSkills.length > 3 && " ..."}</p>
                )}
                <p className="text-gray-600 italic">{job.jobDescription.length > 80 ? job.jobDescription.substring(0, 80) + "..." : job.jobDescription}</p>
              </div>

              {/* Buttons */}
              <div className="mt-2 space-y-2">
                <button onClick={() => setSelectedJob(job)} className="bg-blue-600 text-white px-3 py-1 rounded-md w-full text-xs hover:bg-blue-700">View Details</button>
                <button onClick={() => toggleWatchJob(job.id)} className={`w-full px-3 py-1 rounded-md text-xs transition-all ${followedCards.some((watchedJob) => watchedJob.id === job.id) ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"} text-white`}>
                  {followedCards.some((watchedJob) => watchedJob.id === job.id) ? "Unwatch" : "Watch"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedJob && <JobDetailsModal selectedJob={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
};

export default MainContent;
