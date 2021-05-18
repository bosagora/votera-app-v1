/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { ApolloClient, InMemoryCache, from, ApolloLink, split as apolloSplit } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createUploadLink, ReactNativeFile } from 'apollo-upload-client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import fetch from 'isomorphic-fetch';
import * as mime from 'react-native-mime-types';
import { httpLinkURI, webSocketURI, feedSocketURI } from '../../config/ServerConfig';

console.log(`Link=${httpLinkURI as string} , ${webSocketURI as string} , ${feedSocketURI as string}`);

let contextToken: string | undefined;

export function setToken(token: string) {
    contextToken = token;
}

export function resetToken() {
    contextToken = undefined;
}

const httpLink = createUploadLink({
    uri: `${httpLinkURI as string}/graphql`,
    credentials: 'include',
    fetch: (uri: RequestInfo, options?: RequestInit): Promise<Response> => {
        return fetch(uri, options);
    },
});

const wsClient = new SubscriptionClient(webSocketURI as string, {
    reconnect: true,
});
const wsLink = new WebSocketLink(wsClient);

const authMiddleware = setContext((req, context) => {
    console.group(`${Date.now()} | Apollo call - `, req.operationName);
    console.info('Variables = ', req.variables);
    console.groupEnd();

    if (!contextToken) {
        return context;
    }
    return {
        headers: {
            ...context.headers,
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            authorization: `Bearer ${contextToken}`,
        },
    };
});

const passThroughLink = new ApolloLink((operation, forward) => {
    return forward(operation).map((result) => {
        console.group(`${Date.now()} | Apollo response - `, operation.operationName);
        console.info('result.data = ', result.data);
        console.groupEnd();
        return result;
    });
});

const client = new ApolloClient({
    link: from([
        onError((err) => {
            const { graphQLErrors, networkError, operation, response } = err;
            if (graphQLErrors) {
                graphQLErrors.forEach(({ message, locations, path }) => {
                    console.group(`[GraphQL error]: Message: ${message}`);
                    console.log('- Location : ', locations);
                    console.log('- Path : ', path);
                    console.groupEnd();
                });
            }
            if (networkError) {
                console.group('[Network error]: ', networkError);
                console.log('- operation : ', operation);
                console.log('- response : ', response);
                console.groupEnd();
            }
        }),
        apolloSplit(
            ({ query }) => {
                const definition = getMainDefinition(query);
                return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
            },
            wsLink,
            from([authMiddleware, passThroughLink, httpLink]),
        ),
    ]),
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    proposals: {
                        merge: function (existing, incoming, { variables }) {
                            const offset = variables?.start || 0;
                            var merged = existing ? existing.slice(0) : [];
                            if (incoming.length + offset > merged.length) {
                                var i = 0,
                                    count = merged.length - offset;
                                for (var i = 0; i < count; ++i) {
                                    merged[offset + i] = incoming[i];
                                }
                                merged.push.apply(merged, incoming.slice(count));
                            } else {
                                for (var i = 0; i < incoming.length; ++i) {
                                    merged[offset + i] = incoming[i];
                                }
                            }
                            return merged;
                        },
                    },
                    posts: {
                        merge: function (existing, incoming, { variables }) {
                            const offset = variables?.start || 0;
                            var merged = existing ? existing.slice(0) : [];
                            if (incoming.length + offset > merged.length) {
                                var i = 0,
                                    count = merged.length - offset;
                                for (var i = 0; i < count; ++i) {
                                    merged[offset + i] = incoming[i];
                                }
                                merged.push.apply(merged, incoming.slice(count));
                            } else {
                                for (var i = 0; i < incoming.length; ++i) {
                                    merged[offset + i] = incoming[i];
                                }
                            }
                            return merged;
                        },
                    },
                    listPosts: {
                        merge: function (existing, incoming, { variables }) {
                            const offset = variables?.start || 0;
                            var merged = existing ? existing.slice(0) : [];
                            if (incoming.length + offset > merged.length) {
                                var i = 0,
                                    count = merged.length - offset;
                                for (var i = 0; i < count; ++i) {
                                    merged[offset + i] = incoming[i];
                                }
                                merged.push.apply(merged, incoming.slice(count));
                            } else {
                                for (var i = 0; i < incoming.length; ++i) {
                                    merged[offset + i] = incoming[i];
                                }
                            }
                            return merged;
                        },
                    },
                },
            },
        },
    }),
});

const feedWsClient = new SubscriptionClient(feedSocketURI as string, {
    reconnect: true,
});
const feedLink = new WebSocketLink(feedWsClient);

export const feedClient = new ApolloClient({
    link: feedLink,
    cache: new InMemoryCache(),
});

export const loadUriAsFile = async (uri: string, name?: string): Promise<ReactNativeFile | Blob> => {
    if (uri.startsWith('file:')) {
        const filename = name || uri.split('/').pop();
        return new ReactNativeFile({ uri, name: filename, type: mime.lookup(filename) });
    }

    if (uri.startsWith('https://')) {
        return { uri };
    }

    return fetch(uri).then((response) => response.blob());
};

export default client;
