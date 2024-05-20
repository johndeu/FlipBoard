'use client';
import React, { memo, useState, useEffect } from 'react';

import './FlipBoard.css';

const Step = memo(({ char }) => <span>{char}</span>);

class AudioPool {
  constructor(src, size) {
    this.pool = [];
    this.currentIndex = 0;

    for (let i = 0; i < size; i++) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      this.pool.push(audio);
    }
  }

  play() {
    const audio = this.pool[this.currentIndex];
    audio.currentTime = 0;
    audio.play();

    this.currentIndex = (this.currentIndex + 1) % this.pool.length;
  }
}

// Create an audio pool with a reasonable size, say 10 instances
const flipSoundPool = new AudioPool('Splitflap.mp3', 5);

const playFlipSound = () => {
  flipSoundPool.play();
}

const Flipboard = ({ text }) => {
  const [inputText, setInputText] = useState('');
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
      } else{
        steps.push(String.fromCharCode(currentCharCode));
      }
      currentCharCode += 1;
    }

    return steps;
  };


  const flipText = (inputText) => {
    const baseDelay = 30; // Adjust the base delay as needed (e.g., 300 milliseconds)
    const maxRandomDelay = 40; // Maximum random delay in milliseconds

    const getRandomDelay = () => Math.random() * maxRandomDelay;

    let totalDuration = inputText.replace(/[^A-Za-z]/g, '').length * (baseDelay + maxRandomDelay);

    const animateCharacter = (char, index, steps) => {
      let stepIndex = 0;
      
      const animateStep = () => {
        const stepChar = steps[stepIndex];
        const nextChar = steps[stepIndex + 1] || char;
        const randomDelay = getRandomDelay();
        setFlippedText((prevText) => {
          playFlipSound(); // play the flipping sound
          const newText = [...prevText];
          newText[index] = {
            char: <Step char={stepChar === '\u00A0' ? ' ' : stepChar} />,
            nextChar: <Step char={nextChar === '\u00A0' ? ' ' : nextChar} />,
            nextChar: <Step char={nextChar} />,
            flippingTop: true,
            flippingBottom: true,
          };
          return newText;
        });
        setTimeout(() => {
          setFlippedText((prevText) => {
            playFlipSound(); // play the flipping sound
            const newText = [...prevText];
            newText[index] = {
              char: stepChar === '\u00A0' ? ' ' : stepChar,
              nextChar: nextChar === '\u00A0' ? ' ' : nextChar,
              flippingTop: false,
              flippingBottom: false,
            };
            return newText;
          });
          stepIndex++;
          if (stepIndex < steps.length) {
            setTimeout(animateStep, baseDelay + randomDelay);
          }

        }, baseDelay + randomDelay);
      };
      animateStep();
    };

    inputText.split('').forEach((char, index) => {

      const isAlphanumeric = char.match(/[a-zA-Z0-9]/);
      const isSpecialCharacter = char.match(/[^\w\s]/); // Check for special characters
     
      if (!isAlphanumeric && !isSpecialCharacter && char !== '\u00A0') {
        setFlippedText((prevText) => {
          const newText = [...prevText];
          playFlipSound(); // play the flipping sound
          newText[index] = {
            char: char === '\u00A0' ? ' ' : char,
            nextChar: char === '\u00A0' ? ' ' : char,
            flippingTop: false,
            flippingBottom: false,
          };
          return newText;
        });
      } else {
        const steps = generateSteps('!', char);
        animateCharacter(char, index, steps);
      }
    });
  };



  useEffect(() => {
    // Initialize flippedText with the entire input text
    setFlippedText(inputText.split('').map((char, index) => ({ char: ' ', flippingTop: false, flippingBottom: false, key: generateUniqueKey() })));
    flipText(inputText);
  }, [inputText]);



  const handleButtonClick = (event) => {
    setInputText(event.target.value);
    flipText(inputText);
  };

  return (
    <div>

      <div className="flipboard">
        {flippedText.map((item, index) => (
          <div key={item?.key} className="flipboard-char">
            <div className={`char-top-half ${item?.flippingTop ? 'flippingTop' : ''}`}>{item?.char || '\u00A0'}</div>
            <div className={`char-bottom-half ${item?.flippingBottom ? 'flippingMiddle' : ''}`}>{item?.char || '\u00A0'}</div>
            <div className={`char-bottom-half ${item?.flippingBottom ? 'flippingBottom' : ''}`}>{item?.nextChar || '\u00A0'}</div>
          </div>
        ))}
      </div>

      <input className="inputText" type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} />
      <button onClick={handleButtonClick}>Animate Text</button>
    </div>
  );


};

export default Flipboard;
