import { useCallback, useContext } from 'react';
import { AuthContext } from '~/contexts/AuthContext';
import { InteractionItemFragmentDoc, ToggleLikeInput, useToggleLikeMutation } from '../generated/generated';

export const useInteraction = () => {
    const { user } = useContext(AuthContext);
    // const [getInteractions, { data: interactionData, refetch: interactionRefetch }] = useGetInteractionsLazyQuery({
    //     fetchPolicy: 'cache-and-network',
    //     nextFetchPolicy: 'cache-first',
    // });
    const [toggleLike] = useToggleLikeMutation({
        update(cache, { data: { toggleLike } }) {
            // Cache Data 추가
            console.log(' toggleLike cache update', toggleLike);
            if (toggleLike?.isLike) {
                cache.modify({
                    id: `Post:${toggleLike.interaction?.post?.id}`,
                    fields: {
                        interactions(existingInteractionRefs = [], { readField }) {
                            const newInteractionRef = cache.writeFragment({
                                data: toggleLike?.interaction,
                                fragment: InteractionItemFragmentDoc,
                            });
                            return [...existingInteractionRefs, newInteractionRef];
                        },
                    },
                    broadcast: false,
                });
            } else if (!toggleLike.isLike) {
                // Cache Data 삭제
                cache.modify({
                    id: `Post:${toggleLike.interaction?.post?.id}`,
                    fields: {
                        interactions(existingInteractionRefs, { readField }) {
                            return existingInteractionRefs.filter(
                                (interactionRef) => toggleLike?.interaction?.id !== readField('id', interactionRef),
                            );
                        },
                    },
                    broadcast: false,
                });
            }
        },
    });

    const runToggleLike = useCallback(async ({ isLike, postId }: ToggleLikeInput) => {
        try {
            await toggleLike({
                variables: {
                    input: {
                        isLike,
                        postId,
                        memberId: user?.memberId,
                    },
                },
            });
        } catch (error) {
            console.log('🚀  Interaction.ts ~ runToggleLike ~ error', error);
        }
    }, []);

    return { runToggleLike };
    // return { runToggleLike, interactionData, interactions, interactionRefetch };
};
