import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { SchemaLink } from 'apollo-link-schema';
import { makeExecutableSchema } from 'graphql-tools';

import App from './App';

import registerServiceWorker from './registerServiceWorker';

const cache = new InMemoryCache();

const typeDefs = `
  type Query {
    organization(login: String!): Organization!
  }

  interface Starrable {
    id: ID!
    viewerHasStarred: Boolean!
  }

  type Organization {
    name: String!
    url: String!
    repositories: RepositoryConnection!
  }

  type RepositoryConnection {
    edges: [RepositoryEdge!]!
  }

  type RepositoryEdge {
    node: Repository!
  }

  type Repository implements Starrable {
    id: ID!
    name: String!
    url: String!
    viewerHasStarred: Boolean!
  }

  type Mutation {
    addStar(input: AddStarInput!): AddStarPayload!
  }

  input AddStarInput {
    starrableId: ID!
  }

  type AddStarPayload {
    starrable: Starrable!
  }
`;

const resolvers = {
  Query: {
    organization: (parent, { login }) => ({
      name: login,
      url: `https://github.com/${login}`,
      repositories: {
        edges: [
          {
            node: {
              id: '1',
              name: 'the-road-to-learn-react',
              url: `https://github.com/${login}/the-road-to-learn-react`,
              viewerHasStarred: false,
            },
          },
          {
            node: {
              id: '2',
              name: 'the-road-to-learn-react-chinese',
              url: `https://github.com/${login}/the-road-to-learn-react-chinese`,
              viewerHasStarred: false,
            },
          },
        ],
      },
    }),
  },
  Mutation: {
    addStar: (parent, { input }) => ({
      starrable: {
        id: input.starrableId,
        viewerHasStarred: true,
      },
    }),
  },
  Starrable: {
    __resolveType: () => 'Repository',
  },

};

const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const link = new SchemaLink({ schema: executableSchema });

const GITHUB_BASE_URL = 'https://api.github.com/graphql';

const httpLink = new HttpLink({
  uri: GITHUB_BASE_URL,
  headers: {
    authorization: `Bearer ${
      process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN
      }`,
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache,
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root'),
);

registerServiceWorker();
