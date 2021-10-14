import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Header from '../../components/Header';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';

import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock, FiLoader } from 'react-icons/fi';

import { useRouter } from 'next/router';
import { dateFormat } from '../../util/dateFormat';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <>
        <main className={styles.loading}>
          <FiLoader />
          <h1>Carregando...</h1>
        </main>
      </>
    );
  }


  function countWords() {
    const postText = post.data.content.reduce((total, current) => {
      const text = RichText.asText(current.body);

      if (!text) {
        return total;
      }

      return total.concat(text);
    }, '');

    return postText.split(' ').length;
  }

  const timeEstimmedRead = Math.ceil(countWords() / 200);

  return (
    <>
      <Head>
        <title>{post.data.title} | ig.news | Desafio 03</title>
      </Head>

      <Header />

      <img src={post.data.banner.url} alt="banner" className={styles.banner} />
      <main className={commonStyles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={commonStyles.info}>
            <time>
              <FiCalendar />
              {dateFormat(post.first_publication_date)}
            </time>
            <span>
              <FiUser />
              {post.data.author}
            </span>
            <time>
              <FiClock />
              {timeEstimmedRead} min
            </time>
          </div>
          {post.data.content.map(content => {
            return (
              <section key={content.heading} className={styles.postContent}>
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                ></div>
              </section>
            );
          })}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 5,
    }
  );

  const paths = postsResponse.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug),  {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      ...response.data,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 6, // 6 horas
  };
};
