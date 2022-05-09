import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createWorker } from "tesseract.js";

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    const worker = createWorker({
      logger: (workerData) => {
        if (workerData.status === "recognizing text") {
          setProgress(workerData?.progress || 0);
        }
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
        <h1 className="text-3xl">Tesseract Test</h1>

        {progress < 1 && (
          <div className={`w-full max-w-md`}>
            <label className="block w-full" htmlFor="processing">
              Processing image progress:
            </label>
            <progress
              className="block w-full"
              id="processing"
              value={progress}
              max="1"
            >
              {Math.ceil(progress * 100)}%{" "}
            </progress>
          </div>
        )}

        <div className="grid lg:grid-cols-2 rounded border">
          <div>
            <Image
              src="/screen-shot.png"
              width="1460"
              height="1288"
              alt="Shape Up book screenshot"
            />
          </div>
          <div
            className={`py-4 px-8 bg-gray-100 border-gray-200 rounded whitespace-pre-line ${
              !text && "animate-pulse"
            }`}
          >
            {text && (
              <h3 className="font-medium text-xl mb-6">Recognized Text</h3>
            )}
            {text || "Processing..."}
          </div>
        </div>
      </main>
    </div>
  );
}
