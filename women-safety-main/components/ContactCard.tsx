import React from 'react';
import type { EmergencyContact } from '../types';
import { PhoneIcon, MessageIcon, PencilIcon, TrashIcon } from './Icons';

interface ContactCardProps {
  contact: EmergencyContact;
  onEdit: (contact: EmergencyContact) => void;
  onDelete: (contactId: string) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit, onDelete }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 transition-shadow hover:shadow-md relative">
      <div className="absolute top-3 right-3 flex space-x-1">
        <button 
          onClick={() => onEdit(contact)} 
          className="p-2 text-gray-400 hover:text-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label={`Edit ${contact.name}`}
        >
          <PencilIcon className="h-5 w-5" />
        </button>
        <button 
          onClick={() => onDelete(contact.id)} 
          className="p-2 text-gray-400 hover:text-red-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          aria-label={`Delete ${contact.name}`}
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center">
        <div className="pr-12">
          <h2 className="text-xl font-bold text-gray-800">{contact.name}</h2>
          <p className="text-gray-500">{contact.relation}</p>
          <p className="text-gray-500 mt-1">{contact.phone}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2 w-full sm:w-auto">
          <a
            href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
            className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all"
          >
            <PhoneIcon className="h-5 w-5" />
            <span>Call</span>
          </a>
          <a
            href={`sms:${contact.phone.replace(/[^\d+]/g, '')}`}
            className="flex-1 flex items-center justify-center space-x-2 bg-white text-blue-600 border border-blue-600 font-semibold py-3 px-5 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all"
          >
            <MessageIcon className="h-5 w-5" />
            <span>Message</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
