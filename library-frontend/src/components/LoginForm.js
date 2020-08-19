import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { LOGIN, ME } from '../queries';


const LoginForm = ({ setToken, setUser, setError }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const [login, result] = useMutation(LOGIN, {
        onError: (error) => {
            setError(error.graphQLErrors[0].message)
        }
    })

    const getUser = useQuery(ME)

    const setData = () => {
        const token = result.data && result.data.login.value
        setToken(token)
        localStorage.setItem('token', token)
        const userData = getUser.data && getUser.data.me
        setUser({ username: userData.username, favoriteGenre: userData.favoriteGenre })
    }

    const submit = async (event) => {
        event.preventDefault()
        await login({ variables: { username, password } })
        setData()
    }

    return (
        <div>
            <h4>Login to get recommendations and further actions</h4>
            <form onSubmit={submit}>
                <div>
                    Username <input
                        value={username}
                        onChange={({ target }) => setUsername(target.value)}
                    />
                </div>
                <div>
                    Password <input
                        type='password'
                        value={password}
                        onChange={({ target }) => setPassword(target.value)}
                    />
                </div>
                <button type='submit'>Login</button>
            </form>
        </div>
    )
}

export default LoginForm