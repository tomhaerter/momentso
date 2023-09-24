import { createClient, fetchExchange } from "@urql/vue";
import { cacheExchange } from '@urql/exchange-graphcache';
import { authExchange } from "@urql/exchange-auth";

const url = import.meta.env.VITE_API_URL as string;

function makeClient() {
    return createClient({
        url,
        requestPolicy: "cache-and-network",
        exchanges: [
            cacheExchange({
                updates: {
                    Mutation: {
                        updateTimeEntry(_result, args, cache, _info) {
                            console.log("updateTimeEntry", _result, args, cache, _info)
                            // cache.invalidate({ __typename: "TimeEntry", id: _result.updateTimeEntry });
                        }
                    }
                }
            }),
            authExchange(async (utils) => {
                return {
                    addAuthToOperation(operation) {
                        const token = localStorage.getItem("token");

                        if (!token) return operation;

                        if (!operation.context.fetchOptions) {
                            operation.context.fetchOptions = {};
                        }

                        if (token) {
                            // @ts-expect-error
                            operation.context.fetchOptions.headers = {
                                // @ts-expect-error
                                ...operation.context.fetchOptions.headers,
                                Authorization: token,
                            };
                        }

                        return utils.appendHeaders(operation, {
                            Authorization: token,
                        });
                    },
                    willAuthError(_operation) {
                        return false;
                    },
                    didAuthError(error, _operation) {
                        return error.graphQLErrors.some((e) => e.extensions?.code === "UNAUTHENTICATED");
                    },
                    async refreshAuth() {
                        console.log("refreshAuth");
                    },
                };
            }),
            fetchExchange,
        ],
    });
}

export default makeClient