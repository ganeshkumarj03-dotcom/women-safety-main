import React, { useState, useCallback, useEffect, useRef } from 'react';
import { EmergencyContact } from './types';
import { generateAlertMessage } from './services/geminiService';
import ContactCard from './components/ContactCard';
import AlertModal from './components/AlertModal';
import { InfoIcon, AlertTriangleIcon, QuestionMarkCircleIcon, CloseIcon, MicrophoneIcon, MicrophoneSlashIcon } from './components/Icons';

// Fix: Add TypeScript definitions for the Web Speech API to resolve compilation errors.
// These types are not included in the standard TypeScript DOM library.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}


const initialContacts: EmergencyContact[] = [
  { id: '1', name: 'John Smith', relation: 'Emergency Contact', phone: 'john.smith@gmail.com' },
  { id: '2', name: 'Sarah Johnson', relation: 'Family', phone: 'sarah.johnson@gmail.com' },
  { id: '3', name: 'Emergency Services', relation: 'Local Police', phone: 'emergency@police.gov' },
  { id: '4', name: 'Dr. Miller', relation: 'Personal Doctor', phone: 'dr.miller@clinic.com' },
  { id: '5', name: 'Mike Davis', relation: 'Neighbor', phone: 'mike.davis@email.com' },
];

const STORAGE_KEY = 'emergencyContacts';

enum AlertStatus {
  Ready = 'Ready',
  Requesting = 'Requesting permissions...',
  Location = 'Getting location...',
  Recording = 'Capturing 30s video...',
  Generating = 'Generating alert message...',
  Sending = 'Sending alerts...',
  Sent = 'Alerts Sent!',
  Error = 'Error!',
  Canceled = 'Canceled',
}

// Contact Editor Modal Component
interface ContactEditorModalProps {
  contact: Omit<EmergencyContact, 'id'> | EmergencyContact | null;
  onSave: (contact: Omit<EmergencyContact, 'id'>) => void;
  onClose: () => void;
}

const ContactEditorModal: React.FC<ContactEditorModalProps> = ({ contact, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: contact?.name || '',
        relation: contact?.relation || '',
        phone: contact?.phone || '',
    });
    const [errors, setErrors] = useState({ name: '', relation: '', phone: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = { name: '', relation: '', phone: '' };
        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = 'Full Name is required.';
            isValid = false;
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters.';
            isValid = false;
        }

        if (!formData.relation.trim()) {
            newErrors.relation = 'Relation is required.';
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Email address is required.';
            isValid = false;
        } else if (!emailRegex.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid email address.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formData);
        }
    };
    
    const inputBaseClasses = "mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none";
    const normalClasses = "border-gray-300 focus:ring-blue-500 focus:border-blue-500";
    const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {contact ? 'Edit Contact' : 'Add New Contact'}
                            </h3>
                            <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
                                <CloseIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={`${inputBaseClasses} ${errors.name ? errorClasses : normalClasses}`} required />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="relation" className="block text-sm font-medium text-gray-700">Relation</label>
                                <input type="text" name="relation" id="relation" value={formData.relation} onChange={handleChange} className={`${inputBaseClasses} ${errors.relation ? errorClasses : normalClasses}`} required />
                                {errors.relation && <p className="text-red-500 text-xs mt-1">{errors.relation}</p>}
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={`${inputBaseClasses} ${errors.phone ? errorClasses : normalClasses}`} required />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Cancel
                        </button>
                        <button type="submit" className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Save Contact
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [isAlertModalOpen, setAlertModalOpen] = useState(false);
  const [status, setStatus] = useState<AlertStatus>(AlertStatus.Ready);
  const [error, setError] = useState<string | null>(null);
  const [backendMessage, setBackendMessage] = useState('');
  const [alertResponse, setAlertResponse] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/hello')
      .then(res => res.json())
      .then(data => setBackendMessage(data.message))
      .catch(err => setBackendMessage('Could not connect to backend'));
  }, []);
  
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    try {
      const savedContacts = window.localStorage.getItem(STORAGE_KEY);
      return savedContacts ? JSON.parse(savedContacts) : initialContacts;
    } catch (error) {
      console.error("Failed to parse contacts from localStorage", error);
      return initialContacts;
    }
  });

  // --- Voice Recognition State ---
  const [isListening, setIsListening] = useState(false);
  const [helpCount, setHelpCount] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch (error) {
      console.error("Failed to save contacts to localStorage", error);
    }
  }, [contacts]);
  
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  const handleAddNewContact = () => {
    setEditingContact(null);
    setContactModalOpen(true);
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactModalOpen(true);
  };

  const handleDeleteContact = (contactId: string) => {
    const contactToDelete = contacts.find(c => c.id === contactId);
    if (!contactToDelete) return;

    if (window.confirm(`Are you sure you want to delete the contact "${contactToDelete.name}"? This action cannot be undone.`)) {
      setContacts(prev => prev.filter(c => c.id !== contactId));
    }
  };

  const handleSaveContact = (contactData: Omit<EmergencyContact, 'id'>) => {
    if (editingContact) {
      setContacts(prev => prev.map(c => c.id === editingContact.id ? { ...c, ...contactData } : c));
    } else {
      setContacts(prev => [...prev, { id: `${Date.now()}`, ...contactData }]);
    }
    setContactModalOpen(false);
    setEditingContact(null);
  };

  const resetState = () => {
    setStatus(AlertStatus.Ready);
    setError(null);
    setAlertModalOpen(false);
  };

  const handleSendHelp = useCallback(async (bypassConfirmation = false) => {
    if (!bypassConfirmation) {
        setAlertModalOpen(false);
    }
    setError(null);

    try {
      setStatus(AlertStatus.Requesting);
      
      setStatus(AlertStatus.Location);
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      const { latitude, longitude } = position.coords;

      setStatus(AlertStatus.Recording);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.start();
      
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      recorder.stop();
      stream.getTracks().forEach(track => track.stop());

      const videoBlob = await new Promise<Blob>(resolve => {
          recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
      });
      
      setStatus(AlertStatus.Generating);
      const alertMessage = await generateAlertMessage(latitude, longitude);
      
      setStatus(AlertStatus.Sending);

      const formData = new FormData();
      formData.append('latitude', String(latitude));
      formData.append('longitude', String(longitude));
      formData.append('message', alertMessage);
      formData.append('video', videoBlob, 'emergency-recording.webm');
      formData.append('recipients', JSON.stringify(contacts.map(c => c.phone)));
      
      const response = await fetch('http://localhost:5000/api/send-alert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`The backend service is not available (HTTP status: ${response.status}).`);
      }

      const data = await response.json();
      setAlertResponse(data.message || 'Alert sent successfully!');
      setStatus(AlertStatus.Sent);
      setTimeout(() => {
        setAlertResponse('');
        resetState();
      }, 5000);

    } catch (err: any) {
        let errorMessage = "An unknown error occurred.";
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          errorMessage = "Could not connect to the backend server. Is it running? Please check the instructions.";
        } else if (err.name === 'PermissionDeniedError') {
          errorMessage = "Permissions for camera, microphone, or location were denied. Please enable them in your browser settings.";
        } else if (err.name === 'TimeoutError') {
          errorMessage = "Could not get your location in time. Please check your connection.";
        } else {
          errorMessage = err.message || "Failed to send alert.";
        }
        console.error("Alert failed:", err);
        setError(errorMessage);
        setStatus(AlertStatus.Error);
    }
  }, [contacts]);

  // --- Voice Recognition Effect ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition is not supported by this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim().toLowerCase();
          if (transcript.includes('help')) {
            setHelpCount(prev => prev + 1);
          }
        }
      }
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start(); // Keep listening if it stops unexpectedly
      }
    };
    
    recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
            setError("Microphone permission was denied. Voice control won't work.");
            setIsListening(false);
        } else {
            console.error('Speech recognition error:', event.error);
        }
    };

    recognitionRef.current = recognition;
  }, [isListening]);

  useEffect(() => {
    if (helpCount === 3) {
      handleSendHelp(true); // Bypass confirmation modal
      setHelpCount(0);
      setIsListening(false);
      recognitionRef.current?.stop();
    }
  }, [helpCount, handleSendHelp]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setHelpCount(0);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setHelpCount(0); // Reset count when listening starts
        setError(null); // Clear previous errors
      } catch (e) {
        console.error("Could not start recognition:", e);
      }
    }
  };


  const getStatusColor = () => {
    switch (status) {
      case AlertStatus.Sent:
        return 'bg-green-100 text-green-800';
      case AlertStatus.Error:
        return 'bg-red-100 text-red-800';
      case AlertStatus.Ready:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800 animate-pulse';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded-md">
        <strong>Backend says:</strong> {backendMessage}
      </div>
      {alertResponse && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md">
          <strong>Alert Response:</strong> {alertResponse}
        </div>
      )}
      <div className="container mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
        <header className="mb-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Emergency Contacts</h1>
                    <p className="text-gray-600 mt-1">These contacts will be notified when you press HELP.</p>
                </div>
                <button 
                    onClick={handleAddNewContact}
                    className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-105"
                >
                    Add Contact
                </button>
            </div>
        </header>

        <main className="space-y-4">
          {contacts.map((contact) => (
            <ContactCard 
              key={contact.id} 
              contact={contact} 
              onEdit={handleEditContact}
              onDelete={handleDeleteContact}
            />
          ))}
        </main>
        
        <footer className="mt-12">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                <div className="flex-shrink-0">
                    <InfoIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                    <h3 className="font-semibold text-blue-800">Instructions:</h3>
                    <ol className="list-decimal list-inside text-gray-600 text-sm mt-1 space-y-1">
                        <li>Press HELP to send your location and a short audio/video clip.</li>
                        <li>For hands-free activation, click the microphone icon and say "help" three times.</li>
                        <li>The website will ask for camera, microphone, and location permissions.</li>
                        <li>Ensure internet is available so alerts can be sent.</li>
                    </ol>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-between sticky bottom-0 bg-gray-50/80 backdrop-blur-sm py-4">
                <button 
                    onClick={() => setAlertModalOpen(true)}
                    className="flex items-center space-x-2 bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition-transform transform hover:scale-105 disabled:bg-gray-400"
                    disabled={status !== AlertStatus.Ready && status !== AlertStatus.Sent && status !== AlertStatus.Canceled && status !== AlertStatus.Error}
                >
                    <AlertTriangleIcon className="h-5 w-5" />
                    <span>HELP</span>
                </button>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {isListening && (
                        <div className="text-sm font-semibold text-green-700">
                           Listening... ({helpCount}/3)
                        </div>
                    )}
                    <button 
                        onClick={toggleListening}
                        className={`p-2 rounded-full transition-colors ${isListening ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                        aria-label={isListening ? "Stop listening" : "Start listening"}
                    >
                        {isListening ? <MicrophoneIcon className="h-6 w-6" /> : <MicrophoneSlashIcon className="h-6 w-6" />}
                    </button>
                    <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor()}`}>
                        {status}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600 hidden sm:block">
                        <QuestionMarkCircleIcon className="h-8 w-8" />
                    </button>
                </div>
            </div>
        </footer>
      </div>
      <AlertModal 
        isOpen={isAlertModalOpen}
        onClose={() => {
          setAlertModalOpen(false);
          setStatus(AlertStatus.Canceled);
          setTimeout(resetState, 2000);
        }}
        onConfirm={() => handleSendHelp(false)}
      />
      {isContactModalOpen && (
        <ContactEditorModal
            contact={editingContact}
            onSave={handleSaveContact}
            onClose={() => {
                setContactModalOpen(false);
                setEditingContact(null);
            }}
        />
      )}
    </div>
  );
};


export default App;
