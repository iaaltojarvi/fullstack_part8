import React from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'

const Recommended = ({ show, user }) => {
const result = useQuery(ALL_BOOKS)

    if (!show) {
        return null
    }

    const filtered = result.data && user.me && result.data.allBooks.filter(b => b.genres.includes(user.me.favoriteGenre))

    return (
        <div>
            <h2>{`Welcome ${user.me.username}!`}</h2>
            <h3>{`Recommendations in your favorite genre '${user.me.favoriteGenre}'`}</h3>
            <table>
                <tbody>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Published</th>
                    </tr>
                    {filtered.map(a =>
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