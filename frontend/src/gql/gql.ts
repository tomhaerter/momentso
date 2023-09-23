/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "mutation createTimeEntry($description: String!) {\n  createTimeEntry(input: {description: $description}) {\n    id\n    description\n    createdAt\n    startedAt\n    completedAt\n  }\n}": types.CreateTimeEntryDocument,
    "query timeEntries { timeEntries { id } }": types.TimeEntriesDocument,
    "mutation signIn($email: String!, $password: String!) {\n  signIn(email: $email, password: $password) {\n    token\n    user {\n      id\n      email\n    }\n  }\n}": types.SignInDocument,
    "mutation signUp($email: String!, $password: String!) {\n  signUp(email: $email, password: $password) {\n    token\n    user {\n      id\n      email\n    }\n  }\n}": types.SignUpDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation createTimeEntry($description: String!) {\n  createTimeEntry(input: {description: $description}) {\n    id\n    description\n    createdAt\n    startedAt\n    completedAt\n  }\n}"): (typeof documents)["mutation createTimeEntry($description: String!) {\n  createTimeEntry(input: {description: $description}) {\n    id\n    description\n    createdAt\n    startedAt\n    completedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query timeEntries { timeEntries { id } }"): (typeof documents)["query timeEntries { timeEntries { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation signIn($email: String!, $password: String!) {\n  signIn(email: $email, password: $password) {\n    token\n    user {\n      id\n      email\n    }\n  }\n}"): (typeof documents)["mutation signIn($email: String!, $password: String!) {\n  signIn(email: $email, password: $password) {\n    token\n    user {\n      id\n      email\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation signUp($email: String!, $password: String!) {\n  signUp(email: $email, password: $password) {\n    token\n    user {\n      id\n      email\n    }\n  }\n}"): (typeof documents)["mutation signUp($email: String!, $password: String!) {\n  signUp(email: $email, password: $password) {\n    token\n    user {\n      id\n      email\n    }\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;