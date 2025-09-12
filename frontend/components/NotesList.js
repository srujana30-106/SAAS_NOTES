import { useState, useEffect } from 'react'
import { notesAPI } from '../services/api'

export default function NotesList() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [showArchived])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const response = await notesAPI.getNotes({ archived: showArchived })
      setNotes(response.data.notes)
    } catch (error) {
      setError('Failed to fetch notes')
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      await notesAPI.deleteNote(noteId)
      setNotes(notes.filter(note => note.id !== noteId))
    } catch (error) {
      setError('Failed to delete note')
      console.error('Error deleting note:', error)
    }
  }

  const handleArchive = async (noteId, isArchived) => {
    try {
      await notesAPI.archiveNote(noteId, isArchived)
      fetchNotes() // Refresh the list
    } catch (error) {
      setError('Failed to archive note')
      console.error('Error archiving note:', error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading notes...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {showArchived ? 'Archived Notes' : 'Active Notes'}
        </h2>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {showArchived ? 'Show Active Notes' : 'Show Archived Notes'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {showArchived ? 'No archived notes' : 'No notes yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {showArchived 
              ? 'You haven\'t archived any notes yet.' 
              : 'Create your first note to get started!'
            }
          </p>
          {!showArchived && (
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {notes.map((note) => (
            <div key={note.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{note.title}</h3>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleArchive(note.id, !note.isArchived)}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                      title={note.isArchived ? 'Unarchive' : 'Archive'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4-4 4m6-8l4 4-4 4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 whitespace-pre-wrap line-clamp-3">{note.content}</p>
                
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {note.createdBy.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span>{note.createdBy.email}</span>
                  </div>
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
