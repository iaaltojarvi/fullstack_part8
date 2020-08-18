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
    allBooks: async (root, args) => {
      if (args.genre) {
        const books = await Book.find({genres: { $in: args.genre} }).populate('author', {name: 1})
        return books
      } else {
        const books = await Book.find({}).populate('author', { name: 1 })
        return books
      }
    },
    allAuthors: (root, args) => {
      return Author.find({})
    }
  },
  Author: {
    bookCount: (root, args) => {
      const count = Book.countDocuments({ author: { $in: root._id } })
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
      let author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      return author.save()
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