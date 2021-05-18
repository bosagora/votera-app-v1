import React, { useEffect, useState } from 'react';
import { useUpdateFeedMutation } from '~/graphql/generated/generated';

export const useUpdateFeed = () => {
    const [mutation] = useUpdateFeedMutation();

    const updateFeed = React.useCallback(
        async (feedId: string) => {
            return mutation({
                variables: {
                    input: {
                        where: { id: feedId },
                        data: { isRead: true },
                    },
                },
            }).catch(console.log);
        },
        [],
    );
    return updateFeed;
};


