import { useNavigation } from '@react-navigation/core';
import { Enum_Feeds_Type } from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';

/**
 * Notification 의 Title, Content 데이터를 분기합니다.
 *
 * @param type FeedType
 */
export const getFeed = (type: Enum_Feeds_Type, content: any) => {
    let feedContent: string | undefined;

    const { version, userName, activityName, groupName, proposalTitle, questionTitle, comment } = content;

    switch (type) {
        case Enum_Feeds_Type.NewProposal:
            feedContent = getString('${proposalTitle}이 등록되었으니 확인해보세요&#46; 사전 평가에도 참여하실 수 있습니다&#46;').replace('${proposalTitle}', proposalTitle);
            break;
        case Enum_Feeds_Type.Assess_24HrDeadline:
            feedContent = getString('${proposalTitle}의 사전 평가 종료까지 24시간 남았습니다! 종료전 참여해보세요').replace('${proposalTitle}', proposalTitle);
            break;
        case Enum_Feeds_Type.AssessClosed:
            feedContent = getString('${proposalTitle} 사전평가가 종료되었습니다&#46; 평가 결과를 확인해보세요&#46;').replace('${proposalTitle}', proposalTitle);
            break;
        case Enum_Feeds_Type.VotingStart:
            feedContent = getString('${proposalTitle}의 투표가 시작되었으니 투표에 참여해보세요&#46;').replace('${proposalTitle}', proposalTitle);
            break;
        case Enum_Feeds_Type.Voting_24HrDeadline:
            feedContent = getString('${proposalTitle}의 투표 종료까지 24시간 밖에 남지 않았으니 놓치지 말고 투표하세요').replace('${proposalTitle}', proposalTitle);
            break;
        case Enum_Feeds_Type.VotingClosed:
            feedContent = getString('${proposalTitle} 투표가 종료되었습니다&#46; 결과를 확인해보세요&#46;').replace('${proposalTitle}', proposalTitle);
            break;
        case Enum_Feeds_Type.NewProposalNotice:
            feedContent = getString('${proposalTitle}에 새로운 공지가 등록되었습니다&#46; 확인해보세요&#46;').replace('${proposalTitle}', proposalTitle);
            break;
        case Enum_Feeds_Type.NewOpinionComment:
            feedContent = getString('${userName}님이 당신의 의견에 댓글을 남겼습니다').replace('${userName}', userName);
            break;
        case Enum_Feeds_Type.NewOpinionLike:
            feedContent = getString('${userName}님이 당신의 의견을 추천했습니다').replace('${userName}', userName);
            break;
        default:
            break;
    }

    return { feedContent };
};
String.prototype.allReplace = function (obj: any): string {
    let retStr: any = this;
    for (const x in obj) {
        retStr = retStr.replace(new RegExp(x, 'g'), obj[x]);
    }
    return retStr;
};

export const getNavigationType = (type: Enum_Feeds_Type, navigationParams: any, navigation: any) => {
    let notifyTitle: string | undefined;
    let feedContent: string | undefined;

    const { groupId, proposalId, memberId, activityId, activityType, postId, status } = navigationParams;

    switch (type) {
        case Enum_Feeds_Type.NewProposalNotice: 
            navigation.navigate('Notice', { id: activityId })
            break;
        case Enum_Feeds_Type.NewProposal:
        case Enum_Feeds_Type.VotingStart:
        case Enum_Feeds_Type.VotingClosed:
            navigation.navigate('ProposalDetail', { id: proposalId });
            break;
        case Enum_Feeds_Type.NewOpinionComment:
            navigation.navigate('ProposalDetail', { id: proposalId });
            break;
        default:
            break;
    }

    return { notifyTitle, feedContent };
};
