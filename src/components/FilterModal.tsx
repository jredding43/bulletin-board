import React, { useState } from "react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (filters: {
    employmentType?: string;
    location?: string;
    minSalary?: string;
    maxSalary?: string;
    company?: string;
    category?: string;
    jobTitles?: string[];
    keyword?: string;
  }) => void;
}

// ✅ Job Categories & Matching Job Titles
const jobCategories: Record<string, string[]> = {
  "Technology": ["Software Development", "Cybersecurity", "Data Science", "IT Support", "AI & Machine Learning"],
  "Healthcare": ["Nursing", "Pharmacy", "Medical Assistants", "Physical Therapy"],
  "Construction & Trades": ["Plumbing", "Electrical Work", "Carpentry", "HVAC"],
  "Finance & Business": ["Accounting", "Financial Advising", "Banking", "Insurance"],
  "Education & Training": ["K-12 Teaching", "Tutoring", "Corporate Training"],
  "Retail & Sales": ["Retail Management", "Cashiers", "Sales Representatives"],
  "Hospitality & Tourism": ["Hotel Management", "Restaurant Services", "Event Planning"],
  "Transportation & Logistics": ["Truck Driving", "Delivery Services", "Warehouse & Distribution"],
  "Manufacturing & Industrial": ["Factory Work", "Machinists", "Quality Control"],
  "Marketing & Media": ["Digital Marketing", "Graphic Design", "Social Media Management"],
  "Legal & Government": ["Lawyers", "Paralegals", "Court Reporting", "Law Enforcement"],
  "Science & Engineering": ["Civil Engineering", "Electrical Engineering", "Physics"],
  "Energy & Utilities": ["Renewable Energy", "Oil & Gas", "Solar & Wind Installation"],
  "Agriculture & Farming": ["Crop Farming", "Livestock & Dairy", "Forestry"],
  "Creative & Performing Arts": ["Music", "Acting", "Writing", "Film Production"],
  "Non-Profit & Social Services": ["Community Outreach", "Fundraising", "Counseling"],
  "Telecommunications": ["Cable Installation", "Broadcasting", "Call Centers"],
  "Local & Gig Jobs": ["Handyman Services", "Lawn Care", "Freelance Writing", "Delivery"],
  "Other": ["Other"]
};

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApplyFilter }) => {
  if (!isOpen) return null; // ✅ Prevent modal from rendering if closed

  // ✅ Load saved filters from localStorage
  const [filters, setFilters] = useState(() => {
    try {
      const savedFilters = localStorage.getItem("jobFilters");
      return savedFilters ? JSON.parse(savedFilters) : {};
    } catch (error) {
      console.error("Error parsing jobFilters JSON:", error);
      return {};
    }
  });

  // ✅ Handle filter changes
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev: Record<string, string | string[] | undefined>) => ({
      ...prev,
      [key]: value,
    }));
  };
  

  // ✅ Apply filters correctly
  const handleApplyFilters = () => {
    let appliedFilters = { ...filters };
  
    // ✅ Assign correct job titles based on selected category
    if (filters.category) {
      appliedFilters.jobTitles = jobCategories[filters.category as keyof typeof jobCategories] || [];
    } else {
      appliedFilters.jobTitles = [];
    }
  
    console.log("Final Applied Filters:", appliedFilters); // Debugging
  
    localStorage.setItem("jobFilters", JSON.stringify(appliedFilters));
    onApplyFilter(appliedFilters);
    onClose();
  };
  
  
  

  // ✅ Reset filters
  const handleResetFilters = () => {
    const resetFilters = {
      employmentType: "",
      location: "",
      minSalary: "",
      maxSalary: "",
      company: "",
      category: "",
      keyword: ""
    };
    setFilters(resetFilters);
    localStorage.removeItem("jobFilters");
    onApplyFilter(resetFilters);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-black border border-black">
        <h2 className="text-xl font-bold mb-4">Filter Jobs</h2>

        {/* ✅ Job Category */}
        <label className="block mb-2">
          Job Category:
          <select
            className="w-full p-2 border rounded mt-1 bg-white text-black border-black"
            onChange={(e) => handleFilterChange("category", e.target.value)}
            value={filters.category || ""}
          >
            <option value="">Select Category</option>
            {Object.keys(jobCategories).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        {/* ✅ Employment Type */}
        <label className="block mb-2">
          Employment Type:
          <select
            className="w-full p-2 border rounded mt-1 bg-white text-black border-black"
            onChange={(e) => handleFilterChange("employmentType", e.target.value)}
            value={filters.employmentType || ""}
          >
            <option value="">Select</option>
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="contract">Contract</option>
            <option value="weekend">Weekend</option>
            <option value="day">Day</option>
          </select>
        </label>

        {/* ✅ Location */}
        <label className="block mb-2">
          Location:
          <input
            type="text"
            className="w-full p-2 border rounded mt-1 bg-white text-black border-black"
            onChange={(e) => handleFilterChange("location", e.target.value)}
            value={filters.location || ""}
            placeholder="Enter a city or region"
          />
        </label>

        {/* ✅ Salary Range */}
        <label className="block mb-2">Salary Range:</label>
        <div className="flex space-x-2">
          <input
            type="text"
            className="w-1/2 p-2 border rounded bg-white text-black border-black"
            placeholder="Min Salary"
            onChange={(e) => handleFilterChange("minSalary", e.target.value)}
            value={filters.minSalary || ""}
          />
          <input
            type="text"
            className="w-1/2 p-2 border rounded bg-white text-black border-black"
            placeholder="Max Salary"
            onChange={(e) => handleFilterChange("maxSalary", e.target.value)}
            value={filters.maxSalary || ""}
          />
        </div>

        {/* ✅ Company Name */}
        <label className="block mb-2">
          Company Name:
          <input
            type="text"
            className="w-full p-2 border rounded mt-1 bg-white text-black border-black"
            onChange={(e) => handleFilterChange("company", e.target.value)}
            value={filters.company || ""}
            placeholder="Enter company name"
          />
        </label>

        {/* ✅ Word Match (Search by Keyword) */}
        <label className="block mb-4">
          Keyword Match:
          <input
            type="text"
            className="w-full p-2 border rounded mt-1 bg-white text-black border-black"
            onChange={(e) => handleFilterChange("keyword", e.target.value)}
            value={filters.keyword || ""}
            placeholder="Enter keyword (e.g., 'developer', 'engineer')"
          />
        </label>

        {/* ✅ Buttons */}
        <div className="flex justify-between mt-4">
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={onClose}>
            Cancel
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleApplyFilters}>
            Apply
          </button>
          <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={handleResetFilters}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
