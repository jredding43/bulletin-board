interface TermsProps {
  onClose: () => void;
  onAccept: () => void;
  modalType: "terms" | "privacy" | "acknowledgement";
}

export default function Terms({ onClose, onAccept, modalType }: TermsProps) {
  const modalContent = {
    terms: {
      title: "Terms of Service",
      description: "Here are the Terms of Service. Please read carefully before accepting.",
    },
    privacy: {
      title: "Privacy Policy",
      description: "Here is the Privacy Policy. Please read carefully before accepting.",
    },
    acknowledgement: {
      title: "Acknowledgement of Service",
      description: "This is the Acknowledgement of Service. Please read carefully before accepting.",
    },
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">{modalContent[modalType].title}</h2>
        <p className="text-sm text-gray-600 mb-4">{modalContent[modalType].description}</p>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded-lg">
            Cancel
          </button>
          <button onClick={onAccept} className="px-4 py-2 bg-green-500 text-white rounded-lg">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
