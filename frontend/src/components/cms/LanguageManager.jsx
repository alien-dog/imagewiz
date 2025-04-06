import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { getLanguages, addLanguage, updateLanguage, deleteLanguage } from '../../lib/cms-service';

const LanguageManager = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    is_default: false,
    is_rtl: false,
    locale: ''
  });
  
  // Load languages on component mount
  useEffect(() => {
    fetchLanguages();
  }, []);
  
  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const data = await getLanguages();
      setLanguages(data.languages || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching languages:', err);
      setError('Failed to load languages. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      is_default: false,
      is_rtl: false,
      locale: ''
    });
    setEditingLanguage(null);
    setShowForm(false);
  };
  
  const handleEdit = (language) => {
    setFormData({
      code: language.code,
      name: language.name,
      is_default: language.is_default || false,
      is_rtl: language.is_rtl || false,
      locale: language.locale || ''
    });
    setEditingLanguage(language.code);
    setShowForm(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (editingLanguage) {
        // Update existing language
        await updateLanguage(editingLanguage, formData);
        setSuccess('Language updated successfully!');
      } else {
        // Create new language
        await addLanguage(formData);
        setSuccess('Language created successfully!');
      }
      
      // Refresh languages list and reset form
      await fetchLanguages();
      resetForm();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving language:', err);
      setError('Failed to save language. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (code) => {
    setLoading(true);
    try {
      await deleteLanguage(code);
      
      // Refresh languages list
      await fetchLanguages();
      setSuccess('Language deleted successfully.');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting language:', err);
      setError('Failed to delete language. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Globe className="h-6 w-6 mr-2" />
          Language Management
        </h1>
        <button
          className={`bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded flex items-center ${
            showForm ? 'hidden' : ''
          }`}
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Language
        </button>
      </div>
      
      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}
      
      {/* Language Form */}
      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-700">
              {editingLanguage ? 'Edit Language' : 'Add New Language'}
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={resetForm}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Language Code* (ISO 639-1)
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  readOnly={!!editingLanguage}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    editingLanguage ? 'bg-gray-100' : ''
                  }`}
                  placeholder="en"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Two letter code (e.g., en, es, fr)
                </p>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Language Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="English"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="locale" className="block text-sm font-medium text-gray-700 mb-1">
                Locale
              </label>
              <input
                type="text"
                id="locale"
                name="locale"
                value={formData.locale}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="en_US"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional locale format (e.g., en_US, es_ES)
              </p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700">
                  Set as default language
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_rtl"
                  name="is_rtl"
                  checked={formData.is_rtl}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="is_rtl" className="ml-2 block text-sm text-gray-700">
                  Right-to-left (RTL) language
                </label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded mr-2 hover:bg-gray-50"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                    Saving...
                  </span>
                ) : (
                  'Save Language'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Languages List */}
      {loading && languages.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-teal-500 border-r-teal-500 border-b-transparent border-l-transparent"></div>
          <p className="mt-2 text-gray-600">Loading languages...</p>
        </div>
      ) : languages.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No languages found. Add a new language to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Locale
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Default
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RTL
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {languages.map((language) => (
                <tr key={language.code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{language.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{language.code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{language.locale || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {language.is_default ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Default
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {language.is_rtl ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        RTL
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        className="text-teal-600 hover:text-teal-900"
                        onClick={() => handleEdit(language)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        className={`text-red-600 hover:text-red-900 ${
                          language.is_default ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => !language.is_default && setConfirmDelete(language.code)}
                        disabled={language.is_default}
                        title={language.is_default ? "Default language cannot be deleted" : ""}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this language? This action cannot be undone and 
              will remove all content in this language.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => handleDelete(confirmDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageManager;