import React from "react";

interface SubheaderOneProps {
  onUserProfileClick?: () => void;
  onUserInsightClick?: () => void;
  onCreateJobCardClick?: () => void;
  onBuildJobCard?: () => void;
}

const SubheaderOne: React.FC<SubheaderOneProps> = ({ 
  onUserProfileClick = () => {}, 
  onUserInsightClick = () => {}, 
  onCreateJobCardClick = () => {}, 
  onBuildJobCard = () => {},
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 bg-gray-800 p-4 shadow-md w-full h-full">
      {/* Top Row - User Profile & Insights */}
      <button
        onClick={onUserProfileClick}
        className="bg-white text-black py-3 px-6 rounded-lg shadow hover:bg-green-400 w-full"
      >
        User Profile
      </button>

      <button
        onClick={onUserInsightClick}
        className="bg-white text-black py-3 px-6 rounded-lg shadow hover:bg-green-400 w-full"
      >
        User Insights
      </button>

      {/* Bottom Row - Action Buttons */}
      <button
        onClick={onCreateJobCardClick}
        className="bg-white text-black py-3 px-6 rounded-lg shadow hover:bg-green-400 w-full"
      >
        Create Job Card
      </button>

      <button
        onClick={onBuildJobCard}
        className="bg-white text-black py-3 px-6 rounded-lg shadow hover:bg-green-400 w-full"
      >
        Build Profile Card
      </button>
    </div>
  );
};

export default SubheaderOne;
