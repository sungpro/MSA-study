import React from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

import { ChatClient } from '../protos/chat_grpc_web_pb.js'
import { Message } from '../protos/chat_pb.js'

export default function Home() {

  const PROTO_PATH = '/protos/chat.proto'

  // const { ChatClient } = require('../protos/chat_grpc_web_pb');
  // const { Message } = require('../protos/chat_pb.js');

  var client = new ChatClient('http://localhost:9090', null, null);

  React.useEffect(() => {
    let streamRequest = new Message();
    streamRequest.setUser("박건후");
    
    var stream = client.join(
        streamRequest,
        null
    );

    stream.on('data', function(response) {
        console.log(response);
        setChat(c => [...c, { name : response.array[0], msg : response.array[1] }]);
    });

    return () => {};
    
  },[]);

  const [message, setMessage] = React.useState('')
  const name = 'squirrel'

  const send = () => {
    if (message === '') return;

    const request = new Message();
    request.setText(message);
    request.setUser(name);

    client.join(request, {}, (err, response) => {
      if (response == null) {
        console.log(err)
      } else {
        console.log(response)
      }
    });

    client.send(request, {}, (err, response) => {
        if (response == null) {
          console.log(err)
        } else {
          console.log(response)
        }
    });

    setMessage('')
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <div className={styles.grid}>
          <input type="text" onChange={(e) => setMessage(e.target.value)} />
          {" "}
          <button onClick={send}>chat</button>
        </div>

        <div className={styles.wideGrid}>
          <a href="https://nextjs.org/docs" className={styles.wideCard}>
          <h3>Documentation &rarr;</h3>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>
        </div>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h3>Documentation &rarr;</h3>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h3>Learn &rarr;</h3>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h3>Examples &rarr;</h3>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h3>Deploy &rarr;</h3>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  )
}
