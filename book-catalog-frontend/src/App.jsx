

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/books';

export default function App() {
  const [books, setBooks] = useState([]);
  const [book, setBook] = useState({ 
    title: '', 
    author: '', 
    genre: '', 
    publication_date: '', 
    description: '' 
  });
  const [editId, setEditId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setBooks(response.data.filter(book => !book.is_deleted));
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const addBook = async () => {
    try {
      setLoading(true);
      const response = await axios.post(API_URL, book);
      setBook({ title: '', author: '', genre: '', publication_date: '', description: '' });
      fetchBooks();
      setIsFormVisible(false);
    } catch (error) {
      console.error("Error adding book:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBook = async () => {
    if (!editId) return;
    try {
      setLoading(true);
      await axios.put(`${API_URL}/${editId}`, book);
      setEditId(null);
      setBook({ title: '', author: '', genre: '', publication_date: '', description: '' });
      fetchBooks();
      setIsFormVisible(false);
    } catch (error) {
      console.error("Error updating book:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (id) => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/delete/${id}`);
      setBooks(books.filter(book => book.id !== id));
    } catch (error) {
      console.error("Error deleting book:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book) => {
    setEditId(book.id);
    setBook(book);
    setIsFormVisible(true);
  };

  const resetForm = () => {
    setEditId(null);
    setBook({ title: '', author: '', genre: '', publication_date: '', description: '' });
    setIsFormVisible(false);
  };

  const filteredBooks = books.filter(book => {
    return book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
           book.genre.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const genreOptions = [
    'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 
    'Mystery', 'Romance', 'Biography', 'History', 'Self-Help'
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center text-indigo-800 mb-2">📚 Book Catalog</h1>
        <p className="text-center text-gray-600">Manage your book collection with ease</p>
      </header>
      
      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-64">
          <input 
            type="text" 
            placeholder="Search books..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
        
        <div>
          <button 
            onClick={() => setIsFormVisible(!isFormVisible)} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {isFormVisible ? 'Cancel' : '+ Add New Book'}
          </button>
        </div>
      </div>
      
      {isFormVisible && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-indigo-700">{editId ? 'Edit Book' : 'Add New Book'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input 
                type="text" 
                placeholder="Book title" 
                value={book.title} 
                onChange={(e) => setBook({ ...book, title: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input 
                type="text" 
                placeholder="Author name" 
                value={book.author} 
                onChange={(e) => setBook({ ...book, author: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
              <select 
                value={book.genre} 
                onChange={(e) => setBook({ ...book, genre: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Select Genre</option>
                {genreOptions.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publication Date</label>
              <input 
                type="date" 
                value={book.publication_date} 
                onChange={(e) => setBook({ ...book, publication_date: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              placeholder="Book description" 
              value={book.description} 
              onChange={(e) => setBook({ ...book, description: e.target.value })}
              rows="3"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
            ></textarea>
          </div>
          <div className="flex justify-end gap-2">
            <button 
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button 
              onClick={editId ? updateBook : addBook}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              disabled={!book.title || !book.author || loading}
            >
              {loading ? 'Processing...' : (editId ? 'Update Book' : 'Add Book')}
            </button>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">Loading books...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No books found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBooks.map(b => (
            <div 
              key={b.id} 
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
            >
              <div className="flex justify-between">
                <h3 className="font-semibold text-lg text-indigo-900">{b.title}</h3>
                <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">{b.genre}</div>
              </div>
              <p className="text-gray-600 mb-2">by {b.author}</p>
              {b.publication_date && (
                <p className="text-sm text-gray-500 mb-2">Published: {new Date(b.publication_date).toLocaleDateString()}</p>
              )}
              {b.description && (
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{b.description}</p>
              )}
              <div className="flex justify-end mt-2">
                <div className="space-x-2">
                  <button 
                    onClick={() => handleEdit(b)}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteBook(b.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500 text-right">
        Total books: {filteredBooks.length}
      </div>
    </div>
  );
}