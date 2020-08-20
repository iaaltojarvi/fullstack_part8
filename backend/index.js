const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const config = require('./utils/config')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');

mongoose.set('useFindAndModify', false)

const JWT_SECRET = process.env.JWT_SECRET

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

type User {
username: String!
favoriteGenre: String!
id: ID!
}

type Token {
value: String!
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
  ): Author,

  createUser(
    username: String!
    favoriteGenre: String!
  ): User,

  login(
  username: String!
  password: String!
  ): Token
}

type Query {
bookCount: Int!

authorCount: Int!

allBooks(author: String, genre: String): [Book]!

allAuthors: [Author]

me: User
}
`

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: async (root, args) => {
      if (args.genre) {
        const books = await Book.find({ genres: { $in: args.genre } }).populate('author', { name: 1 })
        return books
      } else {
        const books = await Book.find({}).populate('author', { name: 1 })
        return books
      }
    },
    allAuthors: (root, args) => {
      return Author.find({})
    },
    me: (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("Not authenticated")
      }
      return currentUser
    }
  },
  Author: {
    bookCount: async (root, args) => {
      const count = Book.countDocuments({ author: { $in: root._id } })
      return count
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const author = await Author.findOne({ name: args.author })
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("Not authenticated")
      }
      if (author === null && args.title && args.published) {
        const newAuthor = new Author({ name: args.author })
        const book = new Book({ ...args, author: newAuthor })
        try {
          book.save()
          newAuthor.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        }
      } else {
        const book = new Book({ ...args, author: author })
        try {
          book.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        }
      }
    },

    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("Not authenticated")
      }
      let author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      try {
        author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
    },

    createUser: (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
      try {
        user.save()
      } catch (err) {
        throw new UserInputError(err.message, {
          invalidArgs: args
        })
      }
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new UserInputError("Wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }

    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    console.log('req', req.headers)
    console.log('auth ennen if', auth)
    if (auth && auth.toLowerCase().startsWith('bearer')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      console.log('auth', auth, auth.substring(7))
      const currentUser = await User
        .findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})