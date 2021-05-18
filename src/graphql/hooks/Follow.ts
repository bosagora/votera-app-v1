import React, { useEffect, useState } from 'react';
import { useCreateFollowMutation } from '~/graphql/generated/generated';
import push from '~/services/FcmService';
import LocalStorage from '~/utils/LocalStorage';

export const useCreateFollow = () => {
    const [mutation] = useCreateFollowMutation();
    const createFollow = React.useCallback(
        async (feedAddress: string, targets: string[], pushId?: string, isActive?: boolean) => {
            targets?.forEach((target) => {
                mutation({
                    variables: {
                        input: {
                            data: {
                                target,
                                isActive: isActive || false,
                                member: feedAddress,
                                push: pushId,
                            },
                        },
                    },
                }).catch(console.log);
            });
        },
        [],
    );
    return createFollow;
};
