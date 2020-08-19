import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import Select from 'react-select'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'

const Authors = ({ show, setError }) => {

  const [name, setName] = useState('')
  const [setBornTo, setSetBornTo] = useState('')
  const [selectedOption, setSelectedOption] = useState(null)

  const result = useQuery(ALL_AUTHORS)
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      setError(error.graphQLErrors[0].message)
    }
  })

  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>Loading authors...</div>
  }

  const submit = async (event) => {
    event.preventDefault()
    await editAuthor({ variables: { name, setBornTo } })
      .catch(error => {
        setError(error.message)
      })
    setName('')
    setSetBornTo('')
    setSelectedOption('')
  }

  const handleChange = selectedOption => {
    setSelectedOption(selectedOption)
    setName(selectedOption.value)
  }

  let options =
    result.data.allAuthors.map(author => {
      return { value: author.name, label: author.name }
    })

  return (
    <div>
      <h2>Authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {result && result.data ? result.data.allAuthors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
      <br></br>
      <form onSubmit={submit}>
        <h3>Set birth year</h3>
        <Select
          value={selectedOption}
          onChange={handleChange}
          options={options}
          placeholder={!selectedOption && "Select author"}
          isDisabled={!options.length && true}
        />
        <div>
          Born
          <input
            disabled={!options.length && true}
            value={setBornTo}
            onChange={({ target }) => setSetBornTo(Number(target.value))}
          />
        </div>
        <button type='submit'>Update author</button>
      </form>
    </div >
  )
}

export default Authors
