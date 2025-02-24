import { getUserRepos, ReposResponse } from "@/lib/github";
import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "../Button";
import { LoadingPlaceholder } from "../LoadingPlaceholder";
import { Skeleton } from "../Skeleton";
import { RepoCard } from "./RepoCard";
import type { FetchError } from "ohmyfetch";

type Props = {
	user: string;
};

const REPOS_PER_PAGE = 18;

export const ReposList = ({ user }: Props) => {
	const {
		data: reposData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery<ReposResponse, FetchError>(
		["user", user, "repos"],
		({ pageParam: page }) =>
			getUserRepos({ user, perPage: REPOS_PER_PAGE, page }),
		{
			getNextPageParam: (lastPage, allPages) =>
				lastPage.length === REPOS_PER_PAGE
					? allPages.length + 1
					: false,
		}
	);

	const repos = useMemo(() => {
		if (!reposData) {
			return undefined;
		}

		return reposData.pages.reduce((all, page) => {
			all.push(...page);
			return all;
		}, []);
	}, [reposData]);

	return (
		<div className="flex flex-col gap-4">
			<div
				className="grid gap-4"
				style={{
					gridTemplateColumns:
						"repeat(auto-fill, minmax(12rem, 1fr))",
				}}
			>
				{!repos
					? Array.from({ length: 6 }).map((_, index) => (
							<Skeleton
								className="h-32 border border-normal rounded-md"
								key={index}
							/>
					  ))
					: repos.map(repo => <RepoCard repo={repo} key={repo.id} />)}
			</div>
			{hasNextPage &&
				(isFetchingNextPage ? (
					<LoadingPlaceholder className="w-7 h-7 mx-auto" />
				) : (
					<Button
						className="mx-auto"
						isProcessing={isFetchingNextPage}
						onClick={() => fetchNextPage()}
					>
						Load more
					</Button>
				))}
		</div>
	);
};
