import { formatNumber, formatSize } from "@/lib/format";
import { PackageInfo as PackageInfoResponse } from "@/lib/package";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import dayjs from "dayjs";
import { $fetch, FetchError } from "ohmyfetch";
import { Heading } from "../Heading";
import { Skeleton } from "../Skeleton";

interface PackageInfoProps {
	owner: string;
	repo: string;
	branch?: string | null;
}

export const PackageInfo = ({ owner, repo, branch }: PackageInfoProps) => {
	const { data, isLoading } = useQuery<PackageInfoResponse, FetchError>(
		["package_info", { owner, repo, branch }],
		() =>
			$fetch<{ data: PackageInfoResponse }>(
				`/api/${owner}/${repo}/package`,
				{
					params: { branch },
				}
			).then(response => response.data),
		{
			enabled: !!branch,
		}
	);

	const failedLabel = <span className="text-muted">failed to load</span>;

	return (
		<div className={classNames("flex flex-col gap-1")}>
			<Heading>Package</Heading>

			{isLoading ? (
				<div className="flex flex-col">
					{Array.from({ length: 6 }).map((_, index) => (
						<Skeleton
							className="h-6 w-40 odd:w-24 rounded-md"
							isText={true}
							key={index}
						/>
					))}
				</div>
			) : !data ? (
				<p className="text-muted">No npm package detected.</p>
			) : (
				<ul>
					<li>
						<a
							className="text-link-normal hover:underline"
							href={`https://www.npmjs.com/package/${data.name}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							{data.name}
						</a>
					</li>
					<li>
						Version:{" "}
						{data.npm
							? `${data.npm.version} (${dayjs(
									data.npm.lastPublished
							  ).fromNow()})`
							: failedLabel}
					</li>
					<li>
						Downloads:{" "}
						{data.npm
							? `${formatNumber(
									data.npm.downloadsLastWeek
							  )} (last week)`
							: failedLabel}
					</li>
					<li>
						<a
							className="text-link-normal hover:underline"
							href={`https://bundlephobia.com/package/${data.name}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							Bundle size
						</a>
						:{" "}
						{data.bundle
							? `${formatSize(
									data.bundle.size
							  )} minified (${formatSize(
									data.bundle.gzip
							  )} gzipped)`
							: failedLabel}
					</li>
					<li>
						<a
							className="text-link-normal hover:underline"
							href={`https://packagephobia.com/result?p=${data.name}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							Install size
						</a>
						:{" "}
						{data.package
							? formatSize(data.package.install.bytes)
							: failedLabel}
					</li>
					<li>
						<a
							className="text-link-normal hover:underline"
							href={`https://packagephobia.com/result?p=${data.name}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							Publish size
						</a>
						:{" "}
						{data.package
							? formatSize(data.package.publish.bytes)
							: failedLabel}
					</li>
				</ul>
			)}
		</div>
	);
};
