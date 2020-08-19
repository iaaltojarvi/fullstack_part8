import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries';

const Books = ({ show }) => {
  const [genre, setGenre] = useState(null)

  const result = useQuery(ALL_BOOKS)

  const filtered = genre && result.data.allBooks.filter(b => b.genres.includes(genre))
  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>Loading books...</div>
  }

  let genres = result.data.allBooks.map(b => b.genres).flat()
  const uniqueSet = new Set(genres)
  genres = [...uniqueSet]

  return (
    <div>
      <h2>Books</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {!genre ? (
            result.data && result.data.allBooks.map(a =>
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            )) : (
              filtered.map(a =>
                <tr key={a.title}>
                  <td>{a.title}</td>
                  <td>{a.author.name}</td>
                  <td>{a.published}</td>
                </tr>
              ))
          }
        </tbody>
      </table>
      <br></br>
      {genres.map(g =>
        <button key={g} onClick={() => setGenre(g)}>{g}</button>
      )}
    </div>
  )
}

export default Books