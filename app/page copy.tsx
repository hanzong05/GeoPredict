'use client'

import { useState, useEffect } from 'react';
import { getTodos, createTodo, deleteTodo }  from './api/python';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load todos on mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    const result = await getTodos();
    if (result.success) {
      setTodos(result.data);
    } else {
      setMessage('❌ ' + result.error);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setLoading(true);
    setMessage('');

    const result = await createTodo(newTodo);
    
    if (result.success) {
      setTodos(result.data);
      setNewTodo('');
      setMessage('✅ Todo added!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('❌ ' + result.error);
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    const result = await deleteTodo(id);
    
    if (result.success) {
      setTodos(result.data);
      setMessage('🗑️ Todo deleted!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('❌ ' + result.error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <h1 style={{
          fontSize: '2rem',
          marginBottom: '1rem',
          textAlign: 'center',
          color: '#333'
        }}>
          📝 Todo App
        </h1>

        <p style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '0.9rem',
          marginBottom: '2rem'
        }}>
          Next.js Server Actions + Python API
        </p>

        {/* Message */}
        {message && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            background: message.includes('❌') ? '#fee' : '#efe',
            border: `2px solid ${message.includes('❌') ? '#fcc' : '#cfc'}`,
            color: message.includes('❌') ? '#c00' : '#060',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {message}
          </div>
        )}

        {/* Add Todo Form */}
        <form onSubmit={handleAddTodo} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What do you need to do?"
              style={{
                flex: 1,
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #ddd',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: 'white',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '...' : 'Add'}
            </button>
          </div>
        </form>

        {/* Todo List */}
        <div>
          {todos.length === 0 ? (
            <p style={{
              textAlign: 'center',
              color: '#999',
              padding: '2rem',
              fontSize: '1.1rem'
            }}>
              No todos yet. Add one above! ✨
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <span style={{ fontSize: '1rem', color: '#333' }}>
                    {todo.task}
                  </span>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.9rem',
                      color: 'white',
                      background: '#ef4444',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f0f0f0',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          Total: {todos.length} {todos.length === 1 ? 'todo' : 'todos'}
        </div>
      </div>
    </div>
  );
}