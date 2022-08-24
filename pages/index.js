/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import { useEffect, useState } from "react";
import Tesseract from "tesseract.js";

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
    setTesseractStatus("working");

    Tesseract.recognize(uploadedFile, "eng", {
      logger: (workerData) => {
        console.log(workerData);
      },
    }).then(({ data: { text } }) => {
      setProgress(1);
      setText(text);
      setTesseractStatus("done");
    });
  }, [uploadedFile]);

  function getUrlFromFile(file) {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      setUploadedFileDisplayUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-50">
      <Head>
        <title>OCR | Michael Bonner</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>

      <main className="mx-auto py-12 grid gap-y-8 px-4 lg:px-8">
        <h1 className="text-3xl">Image OCR Tool</h1>
        <p className="max-w-xl">
          This tool uses{" "}
          <a
            className="underline"
            href="https://github.com/tesseract-ocr/tesseract"
          >
            Tesseract
          </a>{" "}
          to scan the uploaded image and detect English characters. Your images
          are never sent to a third party; all the processing happens as a web
          worker on your browser.
        </p>

        <div className="grid lg:grid-cols-2 rounded border">
          <div>
            <div className="py-4 px-8 grid gap-y-8">
              <div className="flex flex-wrap items-center gap-4">
                <label
                  className="text-base font-medium whitespace-nowrap"
                  htmlFor="file"
                >
                  Upload image
                </label>
                <input
                  className="w-full"
                  accept="image/png, image/jpeg"
                  type="file"
                  id="file"
                  onChange={(event) => {
                    if (
                      event.currentTarget.files[0] &&
                      (event.currentTarget.files[0].type === "image/jpeg" ||
                        event.currentTarget.files[0].type === "image/png")
                    ) {
                      setUploadedFile(event.target.files[0]);
                      getUrlFromFile(event.target.files[0]);
                    } else {
                      alert("Unsupported file type");
                    }
                  }}
                />
              </div>
              <div
                className={`w-full transition-opacity ${
                  tesseractStatus === "working" || tesseractStatus === "setup"
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              >
                <div className="flex justify-between mb-1">
                  <span className="text-base font-medium">
                    Processing image
                  </span>
                  <span className="text-sm font-medium">{`${Math.ceil(
                    progress * 100
                  )}%`}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-900 rounded-full h-2.5">
                  <div
                    className="bg-gray-600 dark:bg-gray-400 h-2.5 rounded-full"
                    style={{ width: `${Math.ceil(progress * 100)}%` }}
                  ></div>
                </div>
              </div>
              {uploadedFileDisplayUrl && (
                <div className="relative">
                  {(tesseractStatus === "working" ||
                    tesseractStatus === "setup") && (
                    <div className="absolute inset-0 flex justify-center items-center bg-white dark:bg-gray-400 bg-opacity-50 dark:bg-opacity-50">
                      <span
                        className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gray-500"
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
                    className="m-auto max-h-[70vh]"
                    src={uploadedFileDisplayUrl}
                  />
                </div>
              )}
            </div>
          </div>
          <div
            className={`py-4 px-8 bg-gray-100 dark:bg-gray-700 border-gray-200 rounded whitespace-pre-line`}
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
