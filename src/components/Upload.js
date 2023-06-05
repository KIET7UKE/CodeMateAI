import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { storage } from './Firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf';

function Upload() {
  const [fileUpload, setFileUpload] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({ fileName: '', fileContent: '' });
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
        })
    }
    reader.onerror = () => {
        console.log("file error", reader.error);
      };
  };

  // For adding more files
  const handleAddMore = () => {
    document.getElementById('file-upload').click();
  };


//   For generating reports
  const handleGenerateReport = () => {
    console.log(selectedFiles)
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
    <div className='flex flex-col'>
      <div className='mt-[50px] text-3xl font-mono flex justify-center'>
        Upload your code files here...
      </div>
      <div className='flex justify-center mt-5'>
        <input
          id='file-upload'
          type='file'
          accept='.txt, .doc, .docx, .pdf'
          multiple
          onChange={handleFileUpload}
        />
        <button
          onClick={handleAddMore}
          className='bg-green-400 rounded-md w-[120px] font-semibold ml-5'>
          <FontAwesomeIcon icon={faUpload} /> Add More
        </button>
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
          className='bg-gray-200 rounded-md w-[160px] h-[30px]'
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
        {selectedLanguage && <p>Selected language: {selectedLanguage}</p>}
      </div>
      <div className='flex flex-col justify-center mt-7'>
        <div className='flex justify-center'>
          <button
            className='bg-red-400 rounded-md w-[135px] h-[30px] font-semibold'
            onClick={handleGenerateReport}>
            Generate Report
          </button>
        </div>
        <div className='flex justify-center'>
          {apiData && (
            <div>
              <table className='border-2 border-black'>
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Language</th>
                    <th>Download</th>
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
