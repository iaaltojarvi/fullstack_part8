const { ApolloServer, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const config = require('./utils/config')
const { v4: uuidv4 } = require('uuid');

mongoose.set('useFindAndModify', false)

console.log('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
type Author {
name: String!
id: ID!
born: Int
bookCount: Int
}
type Book {
title: String!
published: Int!
author: Author!
id: ID!
genres: [String]
}
type Mutation {
  addBook(
    title: String!
    published: Int
    author: String!
    genres: [String]
  ): Book,
  editAuthor (
name: String!
  setBornTo: Int!
): Author
}
type Query {
bookCount: Int!
authorCount: Int!
allBooks(author: String, genre: String): [Book!]!
allAuthors: [Author]
}
`

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      return Book.find({})
    },
    allAuthors: (root, args) => {
      return Author.find({})
    }
  },
  Author: {
    bookCount: (root) => {
      const count = books.filter(b => b.author === root.name).length
      return count
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      const author = await Author.findOne({ name: args.author })
      if (author === null) {
        const newAuthor = new Author({ name: args.author })
        newAuthor.save()
        const book = new Book({ ...args, author: newAuthor })
        return book.save()
      } else {
        const book = new Book({ ...args, author: author })
        return book.save()
      }
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      return author.save()
      // const authorExisting = authors.find(a => a.name === args.name)
      // if (authorExisting) {
      //   const updatedAuthor = { ...authorExisting, born: args.setBornTo }
      //   let newArr = authors.filter(a => a.name !== args.name)
      //   authors = newArr.concat(updatedAuthor)
      //   return updatedAuthor
      // } else {
      //   return null
      // }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})