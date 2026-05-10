
import React from 'react';
import { AlertTriangleIcon, CloseIcon, LocationPinIcon, CameraIcon, MicrophoneIcon } from './Icons';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-up">
        <div className="p-6">
          <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900" id="modal-title">
                  Emergency Alert
                </h3>
              </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          <p className="mt-2 text-gray-600">
            You are about to send an emergency alert with your location and a short recording.
          </p>

          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-bold text-red-800">This will:</h4>
            <ul className="mt-2 space-y-2 text-red-700">
              <li className="flex items-center space-x-3">
                <LocationPinIcon className="h-5 w-5 text-red-500" />
                <span>Send your current location to emergency contacts</span>
              </li>
              <li className="flex items-center space-x-3">
                <CameraIcon className="h-5 w-5 text-red-500" />
                <span>Capture a 30-second video recording</span>
              </li>
              <li className="flex items-center space-x-3">
                <MicrophoneIcon className="h-5 w-5 text-red-500" />
                <span>Record audio for context</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
             <p className="text-sm text-yellow-800">
                <span className="font-bold">Note:</span> This app will request permission to access your camera, microphone, and location. Please grant these permissions for the emergency alert to work properly.
             </p>
          </div>

        </div>
        <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 rounded-b-2xl">
          <button
            type="button"
            className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto"
            onClick={onConfirm}
          >
            Send Help
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
            from {
                opacity: 0;
                transform: scale(0.95) translateY(10px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AlertModal;
