import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

type PostProps = {
	id: string | undefined;
};

const Post: NextPage<PostProps> = ({ id }: PostProps) => {
	const router = useRouter();

	if (router.isFallback) {
		// フォールバックページ向けの表示
		return <div>Loading ....</div>;
	}

	return (
		<div>
			<Head>
				<title>Create Next App</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main>
				<p>このページは静的サイト生成によってビルド時に生成されたページです</p>
				<p> {`/posts/${id}に対応するページです`}</p>
			</main>
		</div>
	);
};

// getStaticPathsは生成したいページのパスパラメータの組み合わせを返す
// このファイルはpages/posts/[id].tsxなのでパスパラメータとしてidの値を返す必要がある
export const getStaticPaths: GetStaticPaths = async () => {
	const paths = [
		{
			params: {
				id: "1",
			},
		},
		{
			params: {
				id: "2",
			},
		},
		{
			params: {
				id: "3",
			},
		},
	];
    // fallbackをfalseにすると、pathsで定義されたページ以外は404ページを表示する
	return { paths, fallback: "blocking" };
};

// getStaticPaths実行後にそれぞれのパスに対してgetStaticPropsが実行される

export const getStaticProps: GetStaticProps<PostProps> = async (context) => {
	if (context.params) {
		const id = Array.isArray(context.params["id"]) ? context.params["id"][0] : context.params["id"];
		return {
			props: {
				id,
			},
		};
	}
	const id = "";
	return {
		props: {
			id,
		},
	};
};

export default Post;
