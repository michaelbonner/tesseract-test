/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import { useEffect, useState } from "react";
import { createWorker } from "tesseract.js";

export default function Home() {
  const [tesseractStatus, setTesseractStatus] = useState("initial");
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileDisplayUrl, setUploadedFileDisplayUrl] = useState(null);

  useEffect(() => {
    if (!uploadedFile) {
      return;
    }
    setText("");
    setProgress(0);
    const worker = createWorker({
      logger: (workerData) => {
        if (
          workerData.status === "loading tesseract core" ||
          workerData.status === "initializing tesseract" ||
          workerData.status === "initialized api" ||
          workerData.status === "loading language traineddata" ||
          workerData.status === "loading language traineddata (from cache)" ||
          workerData.status === "initializing api" ||
          workerData.status === "initialized tesseract" ||
          workerData.status === "loaded language traineddata" ||
          workerData.status === "initialized api"
        ) {
          setTesseractStatus("setup");
          return;
        }

        if (
          workerData.status === "recognizing text" &&
          workerData.progress < 1
        ) {
          setTesseractStatus("working");
          setProgress(workerData.progress);
          return;
        }

        if (
          workerData.status === "recognizing text" &&
          workerData.progress === 1
        ) {
          setTesseractStatus("done");
          setProgress(0);
          return;
        }

        console.log("workerData.status", workerData.status);

        setTesseractStatus("initial");
      },
    });

    (async () => {
      await worker.load();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      const {
        data: { text },
      } = await worker.recognize(uploadedFile);
      setText(text);

      await worker.terminate();
    })();

    return () => {
      (async () => {
        await worker.terminate();
      })();
    };
  }, [uploadedFile]);

  function getUrlFromFile(file) {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      setUploadedFileDisplayUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <Head>
        <title>Tesseract Test</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="mx-auto py-12 grid gap-y-8 px-4 lg:px-8">
        <h1 className="text-3xl">Tesseract Test</h1>

        <div
          className={`w-full max-w-md transition-opacity ${
            tesseractStatus === "working" || tesseractStatus === "setup"
              ? "opacity-100"
              : "opacity-0"
          }`}
        >
          <label className="block w-full" htmlFor="processing">
            Processing image progress:
          </label>
          <progress
            className="block w-full"
            id="processing"
            value={progress}
            max="1"
          >
            {Math.ceil(progress * 100)}%
          </progress>
        </div>

        <div className="grid lg:grid-cols-2 rounded border">
          <div className="py-4 px-8 grid gap-y-8">
            <div>
              <label className="block w-full" htmlFor="file">
                Upload image:
              </label>
              <input
                className="block w-full"
                type="file"
                id="file"
                onChange={(e) => {
                  setUploadedFile(e.target.files[0]);
                  getUrlFromFile(e.target.files[0]);
                }}
              />
            </div>
            {uploadedFileDisplayUrl && (
              <div className="relative">
                {(tesseractStatus === "working" ||
                  tesseractStatus === "setup") && (
                  <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-50">
                    <span
                      className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gray-500 bg-opacity-100"
                      disabled=""
                    >
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  </div>
                )}
                <img
                  alt="Uploaded file"
                  className="m-auto"
                  src={uploadedFileDisplayUrl}
                />
              </div>
            )}
          </div>
          <div
            className={`py-4 px-8 bg-gray-100 border-gray-200 rounded whitespace-pre-line`}
          >
            {text && (
              <h3 className="font-medium text-xl mb-6">Recognized Text</h3>
            )}
            {(tesseractStatus === "working" || tesseractStatus === "setup") && (
              <h3 className="font-medium text-xl mb-6 animate-pulse">
                Processing...
              </h3>
            )}
            {!text && !uploadedFile && (
              <h3 className="font-medium text-xl mb-6">
                Select an image to view the OCR text
              </h3>
            )}
            {text}
          </div>
        </div>
      </main>
    </div>
  );
}
