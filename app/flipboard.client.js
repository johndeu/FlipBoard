'use client';
import React, { memo, useState, useEffect } from 'react';

import './FlipBoard.css';

const Step = memo(({ char }) => <span>{char}</span>);

const Flipboard = ({ text }) => {
  const [flippedText, setFlippedText] = useState(Array(text.length).fill({ char: '', flipping: false }));

  // Generate a unique key combining timestamp and a random number
  const generateUniqueKey = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 100000); // Adjust the range as needed
    return `${timestamp}-${randomNum}`;
  };


  // Function to generate intermediate steps between two characters
  const generateSteps = (startChar, endChar) => {
    const steps = [];
    let currentCharCode = startChar.charCodeAt(0);
    const endCharCode = endChar.charCodeAt(0);

    while (currentCharCode <= endCharCode) {
      if (currentCharCode === 32) {
        steps.push('\u00A0'); // Add non-breaking space
      } else if (
        (currentCharCode >= 65 && currentCharCode <= 90) || // Uppercase alphabets
        (currentCharCode >= 97 && currentCharCode <= 122) // Lowercase alphabets
      ) {
        steps.push(String.fromCharCode(currentCharCode));
      }
      currentCharCode += 1;
    }

    return steps;
  };


  // Function to create flip effect by changing characters over time
  const flipText = (inputText) => {
    let delay = 2000; // Adjust the delay as needed (e.g., 50 milliseconds)
    let totalDuration = inputText.replace(/[^A-Za-z]/g, '').length * delay;
  
    inputText.split('').forEach((char, index) => {
      if (!char.match(/[A-Za-z]/)) {
        setFlippedText((prevText) => {
          const newText = [...prevText];
          newText[index] = { char: char === '\u00A0' ? ' ' : char, nextChar: char === '\u00A0' ? ' ' : char, flippingTop: false, flippingBottom: false };
          return newText;
        });
      } else {
        const steps = generateSteps('A', char);
        steps.forEach((stepChar, stepIndex, stepArray) => {
          const nextChar = stepArray[stepIndex + 1] || stepChar; // Define nextChar here
          setTimeout(() => {
            setFlippedText((prevText) => {
              const newText = [...prevText];
              newText[index] = { char: <Step char={stepChar} />, nextChar: <Step char={nextChar} />, flippingTop: true, flippingBottom: true };
              return newText;
            });
            setTimeout(() => {
              setFlippedText((prevText) => {
                const newText = [...prevText];
                newText[index] = { char: stepChar, nextChar: nextChar, flippingTop: false, flippingBottom: false };
                return newText;
              });
            }, delay);
          }, index * totalDuration + (stepIndex * totalDuration) / steps.length);
        });
      }
    });
  };
  
  


  useEffect(() => {
    // Initialize flippedText with the entire input text
    setFlippedText(text.split('').map((char, index) => ({ char: ' ', flipping: false, key: generateUniqueKey() })));
    flipText(text);
  }, [text]);

  return (
    <div className="flipboard">
    {flippedText.map((item, index) => (
      <span key={item.key} className="flipboard-char">
        <span className={`char-top-half ${item.flippingTop ? 'flippingTop' : ''}`}>{item.char || '\u00A0'}</span>
        <span className={`char-bottom-half ${item.flippingBottom ? 'flippingBottom' : ''}`}>{item.nextChar || '\u00A0'}</span>
      </span>
    ))}
  </div>
  
  );


};

export default Flipboard;
