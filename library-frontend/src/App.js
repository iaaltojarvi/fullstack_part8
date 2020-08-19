
import React, { useState, useEffect } from 'react'
import { useApolloClient, useQuery } from '@apollo/client'
import { ME } from './queries'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Notify from './components/Notify'
import Recommended from './components/Recommended';

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [user, setUser] = useState({ username: '', favoriteGenre: '' })
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
        <button onClick={() => setPage('authors')}>Authors</button>
        <button onClick={() => setPage('books')}>Books</button>
        {token &&
          <div>
            <button onClick={() => setPage('add')}>Add book</button>
            <button onClick={() => setPage('recoms')}>Recommended</button>
            <button onClick={() => logout()}>Logout</button>
          </div>
        }
      </div>
      {errorMessage && <Notify errorMessage={errorMessage} />}
      <br></br>
      {!token && <LoginForm setToken={setToken} setUser={setUser} setError={notify} />}
      <Authors
        show={page === 'authors'} setError={notify} token={token}
      />
      <Books
        show={page === 'books'} setError={notify}
      />
      <NewBook
        show={page === 'add'} setError={notify}
      />
      <Recommended show={page === 'recoms'} user={user} setError={notify} />
    </div >
  )
}

export default App