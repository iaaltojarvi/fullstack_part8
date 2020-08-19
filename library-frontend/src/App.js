
import React, { useState } from 'react'
import { useApolloClient } from '@apollo/client';
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null
  }

  return (
    <div style={{ color: 'red' }}>
      {errorMessage}
    </div>
  )
}


const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  return (
    <div>
      <div>
        {errorMessage && <Notify errorMessage={errorMessage} />}
        <button onClick={() => setPage('authors')}>Authors</button>
        <button onClick={() => setPage('books')}>Books</button>
        {token &&
          <div>
            <button onClick={() => setPage('add')}>Add book</button>
            <button onClick={() => logout()}>Logout</button>
          </div>
        }
      </div>
      {!token && <LoginForm setToken={setToken} setError={notify} />}
      <Authors
        show={page === 'authors'} setError={notify} token={token}
      />
      <Books
        show={page === 'books'} setError={notify}
      />
      <NewBook
        show={page === 'add'} setError={notify}
      />
    </div >
  )
}

export default App