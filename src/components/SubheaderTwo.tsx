import React from "react";

const JobInsights: React.FC = () => {
  return (
    <div className="grid grid-cols-5 grid-rows-2 gap-2 bg-emerald-700 p-2 rounded-b-sm shadow-md">
      {/* Left Side - User Insights (Spanning Two Rows) */}
      {/* Top Row - Link Buttons */}
      <div className="col-span-4 grid grid-cols-4 gap-2">
        <button className="bg-white text-black py-2 px-4 rounded-full shadow hover:bg-gray-100">
            Link
        </button>
        <button className="bg-white text-black py-2 px-4 rounded-full shadow hover:bg-gray-100">
            Link
        </button>
        <button className="bg-white text-black py-2 px-4 rounded-full shadow hover:bg-gray-100">
            Link
        </button>
        <button className="bg-white text-black py-2 px-4 rounded-full shadow hover:bg-gray-100">
            Link
        </button>
      </div>

      {/* Bottom Row - Job Categories (Centered) */}
      <div className="col-span-4 flex justify-between">
        <button className="bg-white text-black py-3 px-6 rounded-lg shadow hover:bg-gray-100">
          Job Searches
        </button>
        <button className="bg-white text-black py-3 px-6 rounded-lg shadow hover:bg-gray-100">
          Jobs Applied
        </button>
        <button className="bg-white text-black py-3 px-6 rounded-lg shadow hover:bg-gray-100">
          New Jobs Watching
        </button>
      </div>
    </div>
  );
};

export default JobInsights;
