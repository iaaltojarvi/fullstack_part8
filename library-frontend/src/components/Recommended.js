import React from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ME } from '../queries'

const Recommended = ({ show }) => {
    const booksData = useQuery(ALL_BOOKS)
    const userData = useQuery(ME, {
        options: { fetchPolicy: 'no-cache' }
    })

    if (!show) {
        return null
    }

    const filtered = booksData.data && booksData.data.allBooks.filter(b => b.genres.includes(userData.data && userData.data.me.favoriteGenre))

    return (
        <div>
            <h2>{`Welcome ${userData.data && userData.data.me.username}!`}</h2>
            <h3>{`Recommendations in your favorite genre '${userData.data && userData.data.me.favoriteGenre}'`}</h3>
            <table>
                <tbody>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Published</th>
                    </tr>
                    {filtered && filtered.map(a =>
                        <tr key={a.title}>
                            <td>{a.title}</td>
                            <td>{a.author.name}</td>
                            <td>{a.published}</td>
                        </tr>
                    )
                    }
                </tbody>
            </table>
        </div>
    )
}

export default Recommended