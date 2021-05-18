import React from 'react';
import { useCreatePushMutation, useUpdatePushMutation } from '~/graphql/generated/generated';

export const useCreatePush = () => {
    const [mutation] = useCreatePushMutation();

    const createPush = React.useCallback(async (pushToken: string) => {
        return mutation({
            variables: {
                input: {
                    data: {
                        token: pushToken,
                    },
                },
            },
        });
    }, []);

    return createPush;
};

export const useUpdatePush = () => {
    const [mutation] = useUpdatePushMutation();

    const updatePush = React.useCallback(async (pushId: string, newPushToken: string) => {
        return mutation({
            variables: {
                input: {
                    where: {
                        id: pushId,
                    },
                    data: {
                        token: newPushToken,
                    },
                },
            }
        });
    }, []);
    return updatePush;
};
