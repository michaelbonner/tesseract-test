import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createWorker } from "tesseract.js";

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("processing...");

  useEffect(() => {
    const worker = createWorker({
      logger: (m) => {
        console.log("m", m);
        setProgress(m?.progress);
      },
    });

    (async () => {
      await worker.load();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      const {
        data: { text },
      } = await worker.recognize("/screen-shot.png");
      setText(text);

      await worker.terminate();
    })();
  }, []);

  return (
    <div>
      <Head>
        <title>Tesseract Test</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-7xl mx-auto py-12 grid gap-y-8 px-4 lg:px-8">
        <h1 className="text-xl">Tesseract Test</h1>

        <div>
          <label htmlFor="processing">Processing progress:</label>
          <progress id="processing" value={progress} max="1">
            {Math.ceil(progress * 100)}%{" "}
          </progress>
        </div>

        <div className="py-4 px-8 bg-gray-100 border-gray-200 rounded whitespace-pre-line">
          {text}
        </div>

        <div className="py-4 px-8 bg-gray-200">
          <Image
            src="/screen-shot.png"
            width="1460"
            height="1288"
            alt="Shape Up book screenshot"
          />
        </div>
      </main>
    </div>
  );
}
