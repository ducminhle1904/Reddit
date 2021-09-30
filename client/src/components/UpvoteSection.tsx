import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import {
  PostWithUserInfoFragment,
  useVoteMutation,
  VoteType,
} from "../generated/graphql";

interface UpvoteSectionProps {
  post: PostWithUserInfoFragment;
}

enum VoteTypeValue {
  Upvote = 1,
  Downvote = -1,
}

function UpvoteSection({ post }: UpvoteSectionProps) {
  const [vote, { loading }] = useVoteMutation();
  const [loadingState, setLoadingState] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >("not-loading");

  const upvote = async (postId: string) => {
    setLoadingState("upvote-loading");
    await vote({
      variables: {
        inputVoteValue: VoteType.Upvote,
        postId: parseInt(postId),
      },
    });
    setLoadingState("not-loading");
  };

  const downvote = async (postId: string) => {
    setLoadingState("downvote-loading");
    await vote({
      variables: {
        inputVoteValue: VoteType.Downvote,
        postId: parseInt(postId),
      },
    });
    setLoadingState("not-loading");
  };
  return (
    <Flex direction="column" alignItems="center" mr={4}>
      <IconButton
        isLoading={loading && loadingState === "upvote-loading"}
        icon={<ChevronUpIcon />}
        aria-label="upvote"
        onClick={
          post.voteType === VoteTypeValue.Upvote
            ? undefined
            : upvote.bind(this, post.id)
        }
        colorScheme={
          post.voteType === VoteTypeValue.Upvote ? "green" : undefined
        }
      />
      {post.points}
      <IconButton
        isLoading={loading && loadingState === "downvote-loading"}
        icon={<ChevronDownIcon />}
        aria-label="downvote"
        onClick={
          post.voteType === VoteTypeValue.Downvote
            ? undefined
            : downvote.bind(this, post.id)
        }
        colorScheme={
          post.voteType === VoteTypeValue.Downvote ? "red" : undefined
        }
      />
    </Flex>
  );
}

export default UpvoteSection;
