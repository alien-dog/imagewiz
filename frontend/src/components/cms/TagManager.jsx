import React, { useState, useEffect } from 'react';
import { 
  Tag as TagIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { getTags, addTag, updateTag, deleteTag } from '../../lib/cms-service';

const TagManager = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });
  
  // Load tags on component mount
  useEffect(() => {
    fetchTags();
  }, []);
  
  const fetchTags = async () => {
    setLoading(true);
    try {
      const data = await getTags();
      setTags(data.tags || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Failed to load tags. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };
  
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData({
      ...formData,
      name: newName,
      // Only auto-generate slug if it's empty or matches previous auto-generated slug
      slug: formData.slug === generateSlug(formData.name) 
        ? generateSlug(newName)
        : formData.slug
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: ''
    });
    setEditingTag(null);
    setShowForm(false);
  };
  
  const handleEdit = (tag) => {
    setFormData({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || ''
    });
    setEditingTag(tag.id);
    setShowForm(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (editingTag) {
        // Update existing tag
        await updateTag(editingTag, formData);
        setSuccess('Tag updated successfully!');
      } else {
        // Create new tag
        await addTag(formData);
        setSuccess('Tag created successfully!');
      }
      
      // Refresh tags list and reset form
      await fetchTags();
      resetForm();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving tag:', err);
      setError('Failed to save tag. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteTag(id);
      
      // Refresh tags list
      await fetchTags();
      setSuccess('Tag deleted successfully.');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting tag:', err);
      setError('Failed to delete tag. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <TagIcon className="h-6 w-6 mr-2" />
          Tag Management
        </h1>
        <button
          className={`bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded flex items-center ${
            showForm ? 'hidden' : ''
          }`}
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Tag
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
      
      {/* Tag Form */}
      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-700">
              {editingTag ? 'Edit Tag' : 'Create New Tag'}
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={resetForm}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug*
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used in URLs. Auto-generated from name if left empty.
              </p>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
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
                  'Save Tag'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Tags List */}
      {loading && tags.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-teal-500 border-r-teal-500 border-b-transparent border-l-transparent"></div>
          <p className="mt-2 text-gray-600">Loading tags...</p>
        </div>
      ) : tags.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No tags found. Create a new tag to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{tag.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {tag.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        className="text-teal-600 hover:text-teal-900"
                        onClick={() => handleEdit(tag)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => setConfirmDelete(tag.id)}
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
              Are you sure you want to delete this tag? This action cannot be undone and 
              will remove the tag from all associated posts.
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

export default TagManager;