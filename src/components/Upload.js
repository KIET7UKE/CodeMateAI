import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faUpload } from '@fortawesome/free-solid-svg-icons';
import { storage } from './Firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf';

function Upload() {
  const [fileUpload, setFileUpload] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({
    fileName: '',
    fileContent: '',
  });
  const [apiData, setAPIData] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const handleFileUpload = (e) => {
    const selectedFiles = e.target.files[0];
    setFileUpload(selectedFiles);
    const reader = new FileReader();
    reader.readAsText(selectedFiles);
    reader.onload = () => {
      setSelectedFiles({
        fileName: selectedFiles.name,
        fileContent: reader.result,
      });
    };
    reader.onerror = () => {
      console.log('file error', reader.error);
    };
  };

  // For adding more files
  const handleAddMore = () => {
    document.getElementById('file-upload').click();
  };

  //   For generating reports
  const handleGenerateReport = () => {
    console.log(selectedFiles);
    if (fileUpload == null) return;
    if (selectedLanguage.length > 0) {
      const mainRef = ref(storage, `files/${fileUpload.name + uuidv4()}`);
      uploadBytes(mainRef, fileUpload).then(() => {
        alert('Files uploaded');
      });
      fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: selectedLanguage,
          version: '*',
          files: [
            {
              content: selectedFiles.fileContent,
            },
          ],
          args: [],
          stdin: '',
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setAPIData(data);
        })
        .catch((error) => {
          // Handle the error
          console.error('Error:', error);
        });
    } else {
      alert('select a language');
    }
  };

  // For downloading reports
  const handleDownloadReport = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleString();
    const lineHeight = 10;
    // Set the initial position for the text
    let textPositionY = 10;
    // Add the date
    doc.text(`Date: ${currentDate}`, 10, textPositionY);
    textPositionY += lineHeight;
    // Add Sample code
    const codeUploaded = doc.splitTextToSize(selectedFiles.fileContent, 180);
    doc.text(` CODE UPLOADED: ${codeUploaded}`, 10, textPositionY);
    textPositionY += codeUploaded.length * lineHeight;
    // Add the output
    const codeLanguage = doc.splitTextToSize(apiData.language, 180);
    doc.text(` Code Language : ${codeLanguage}`, 10, textPositionY);
    textPositionY += codeLanguage.length * lineHeight;
    const codeError = doc.splitTextToSize(apiData.run.stderr, 180);
    doc.text(` CODE Errors: ${codeError}`, 10, textPositionY);
    textPositionY += codeError.length * lineHeight;
    const codeOutput = doc.splitTextToSize(apiData.run.output, 180);
    doc.text(` CODE Output: ${codeOutput}`, 10, textPositionY);
    textPositionY += codeOutput.length * lineHeight;
    // ======= saving the pdf report ======
    doc.save(`${selectedLanguage}_report${currentDate}.pdf`);
  };

  // FOr changing the language
  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  return (
    <div className='flex flex-col bg-red-300 h-[750px]'>
      <div className='mt-[50px] text-3xl font-mono flex justify-center'>
        Upload your code files here...
      </div>
      <div className='flex flex-col'>
        <div className='flex items-center justify-center w-full'>
          <label
            htmlFor='file-upload'
            className='flex flex-col items-center justify-center w-[400px] mt-2 h-64 border-2 border-dashed border-red-950 rounded-lg cursor-pointer bg-red-200 dark:hover:bg-red-100'>
            <div className='flex flex-col items-center justify-center pt-5 pb-6'>
              <svg
                aria-hidden='true'
                className='w-10 h-10 mb-3 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                />
              </svg>
              <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                <span className='font-semibold'>Click to upload</span> or drag
                and drop
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                TXT, DOCX, PDF(MAX. 800x400px)
              </p>
            </div>
            <input
              className='hidden'
              id='file-upload'
              type='file'
              accept='.txt, .doc, .docx, .pdf'
              multiple
              onChange={handleFileUpload}
            />
          </label>
        </div>
        <div className='flex justify-center mt-5'>
          <button
            onClick={handleAddMore}
            className='bg-red-200 rounded-md w-[120px] font-semibold'>
            <FontAwesomeIcon icon={faUpload} /> Add More
          </button>
        </div>
        {selectedFiles.length > 0 && (
          <ul>
            {selectedFiles.map((file, index) => {
              <li key={index}>{file.name}</li>;
            })}
          </ul>
        )}
      </div>
      <div className='flex justify-center mt-5'>
        <select
          className='bg-red-200 rounded-md w-[160px] h-[30px]'
          value={selectedLanguage}
          onChange={handleLanguageChange}>
          <option value=''>Select a language</option>
          <option value='javascript'>JavaScript</option>
          <option value='python'>Python</option>
          <option value='java'>Java</option>
          <option value='c++'>C++</option>
          <option value='c#'>C#</option>
          <option value='typeScript'>TypeScript</option>
          <option value='ruby'>Ruby</option>
          <option value='go'>Go</option>
          <option value='swift'>Swift</option>
          <option value='kotlin'>Kotlin</option>
        </select>
        {selectedLanguage && <p className='font-semibold ml-2'>Selected language: {selectedLanguage}</p>}
      </div>
      <div className='flex flex-col justify-center mt-7'>
        <div className='flex justify-center'>
          <button
            className='bg-red-200 rounded-md w-[135px] h-[30px] font-semibold'
            onClick={handleGenerateReport}>
            Generate Report
          </button>
        </div>
        <div className='flex justify-center'>
          {apiData && (
            // <div>
            //   <table className='border-2 border-black mt-5'>
            //     <thead>
            //       <tr>
            //         <th>File Name</th>
            //         <th>Language</th>
            //         <th>Download</th>
            //       </tr>
            //     </thead>
            //     <tbody>
            //       <tr key={selectedFiles.fileName}>
            //         <td>{selectedFiles.fileName}</td>
            //         <td>{apiData.language}</td>
            //         <td>
            //           <button onClick={handleDownloadReport}>
            //             <FontAwesomeIcon icon={faDownload} /> Download
            //           </button>
            //         </td>
            //       </tr>
            //     </tbody>
            //   </table>
            // </div>
            <div className='relative overflow-x-auto shadow-md sm:rounded-lg mt-5 w-[400px]'>
              <table className='w-full text-sm text-left text-black dark:text-black'>
                <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
                  <tr>
                    <th scope='col' className='px-6 py-3'>
                      File Name
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      Language
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      Download
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr key={selectedFiles.fileName}>
                    <td>{selectedFiles.fileName}</td>
                    <td>{apiData.language}</td>

                    <td>
                      <button onClick={handleDownloadReport}>
                        <FontAwesomeIcon icon={faDownload} /> Download
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Upload;
