import { Badge } from "@/components/Badge";
import { GithubIcon } from "@/components/icons/GithubIcon";
import { RepoLocsSection } from "@/components/locs/RepoLocsSection";
import { MetaTags } from "@/components/MetaTags";
import { CommitsHeatmapSection } from "@/components/repo/CommitsHeatmapSection";
import { PackageInfo } from "@/components/repo/PackageInfo";
import { RepoHealthSection } from "@/components/repo/RepoHealthSection";
import { RepoStats } from "@/components/repo/RepoStats";
import { Skeleton } from "@/components/Skeleton";
import { Spacer } from "@/components/Spacer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatRepoSize, formatTitle } from "@/lib/format";
import { getRepo, RepoResponse } from "@/lib/github";
import { removeProtocol } from "@/utils";
import { ExternalLinkIcon } from "@heroicons/react/outline";
import { useQuery } from "@tanstack/react-query";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import type { FetchError } from "ohmyfetch";
import { useEffect } from "react";

interface PageProps {
	owner: string;
	repo: string;
	branch: string | null;
}

export const getServerSideProps: GetServerSideProps<
	PageProps,
	{ owner: string; repo: string }
> = async ({ req, res, params, query }) => {
	res.setHeader("cache-control", "public, max-age=600");
	return {
		props: {
			owner: params!.owner,
			repo: params!.repo,
			branch: (query.branch as string | undefined) ?? null,
		},
	};
};

export const RepoPage = ({
	owner,
	repo: repoName,
	branch: branchProp,
}: PageProps) => {
	const router = useRouter();
	const isSmallOrLarger = useMediaQuery("sm");
	const branch = (router.query.branch as string | undefined) ?? branchProp;

	const { data: repo } = useQuery<RepoResponse, FetchError>(
		["repos", repoName],
		() => getRepo({ owner, repo: repoName })
	);

	useEffect(() => {
		const defaultBranch = repo?.default_branch;
		if (!branch && defaultBranch) {
			router.replace(
				{
					pathname: window.location.pathname,
					query: {
						...router.query,
						branch: defaultBranch,
					},
				},
				undefined,
				{ scroll: false, shallow: true }
			);
		}
	}, [repo, branch, router]);

	let imagePath = `api/${owner}/${repoName}/og-image`;
	if (branch) {
		imagePath += `?branch=${encodeURIComponent(branch)}`;
	}

	return (
		<div className="flex flex-col gap-2">
			<MetaTags
				title={formatTitle(`${owner}/${repoName}`)}
				canonicalPath={`/${owner}/${repoName}`}
				image={imagePath}
			/>

			<div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
				<div className="flex gap-1 items-center whitespace-nowrap text-xl text-muted w-full xs:w-auto">
					<a
						className="w-[1.25em] h-[1.25em] transition-colors duration-100 hover:text-link-normal"
						href={`https://github.com/${owner}/${repoName}`}
						target="_blank"
						rel="noopener noreferrer"
						title="Repo source"
					>
						<GithubIcon />
					</a>
					<Link
						href={`/${owner}`}
						className="block text-link-normal hover:underline"
					>
						{owner}
					</Link>{" "}
					/{" "}
					<Link
						href={`/${owner}/${repoName}`}
						className="text-link-normal hover:underline"
					>
						{repoName}
					</Link>
				</div>

				{repo && (
					<div className="flex flex-grow gap-2 flex-wrap">
						{repo.archived && (
							<Badge
								className="flex-shrink-0 text-xs"
								color="outlined"
								title="Repo is archived"
							>
								Archived
							</Badge>
						)}
						{repo.fork && (
							<Badge
								className="flex-shrink-0 text-xs"
								color="outlined"
								title="Repo is a fork"
							>
								Fork
							</Badge>
						)}
						<Badge
							className="flex-shrink-0 text-xs"
							color="outlined"
							title="Repo size"
						>
							{formatRepoSize(repo.size)}
						</Badge>

						<Spacer className="hidden xs:block" />

						<RepoStats
							watchers={repo.subscribers_count}
							stars={repo.stargazers_count}
							forks={repo.forks}
						/>
					</div>
				)}
			</div>

			{!repo ? (
				<div className="flex flex-wrap gap-2">
					{Array.from({ length: 3 }).map((_, index) => (
						<Skeleton
							className="h-6 w-14 rounded-md"
							isText={true}
							key={index}
						/>
					))}
				</div>
			) : (
				repo.topics.length !== 0 && (
					<div className="flex flex-wrap gap-2">
						{repo.topics.map(topic => (
							<Badge className="px-3 text-xs" key={topic}>
								{topic}
							</Badge>
						))}
					</div>
				)
			)}

			<div className="flex flex-col gap-1">
				<Skeleton
					className="h-6 rounded-md sm:w-3/4"
					isText={true}
					isLoading={repo === undefined}
				>
					{repo?.description && <p>{repo.description}</p>}
				</Skeleton>

				<Skeleton
					className="h-6 rounded-md sm:w-36"
					isText={true}
					isLoading={repo === undefined}
				>
					{repo?.homepage && (
						<a
							className="max-w-full w-max text-link-normal hover:underline truncate"
							href={repo.homepage}
							target="_blank"
							rel="noopener noreferrer"
						>
							<ExternalLinkIcon className="inline-block w-4 h-4" />{" "}
							{removeProtocol(repo.homepage)}
						</a>
					)}
				</Skeleton>
			</div>

			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				<RepoHealthSection owner={owner} repo={repoName} />
				<PackageInfo owner={owner} repo={repoName} branch={branch} />
			</div>

			<CommitsHeatmapSection
				className="hidden sm:flex"
				enabled={isSmallOrLarger}
				owner={owner}
				repo={repoName}
			/>

			<RepoLocsSection
				owner={owner}
				repo={repoName}
				branch={branch}
				defaultBranch={repo?.default_branch}
			/>
		</div>
	);
};

export default RepoPage;
