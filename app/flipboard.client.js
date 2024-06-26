'use client';
import React, { memo, useState, useEffect } from 'react';

import './FlipBoard.css';


const specialCharacters = {
  '@R': '🟥', // Red card
  '@G': '🟩', // Green card
  '@W': '⬜', // White card
};

const allowedChars = '⬜🟩🟥!?.@$0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#%^&*()_-+={[}]|\:;"<,>/~`';
const coloredCards = Object.values(specialCharacters); // Red, green, and white cards


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
  const [prevInputText, setPrevInputText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);


  // Generate a unique key combining timestamp and a random number
  const generateUniqueKey = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 100000); // Adjust the range as needed
    return `${timestamp}-${randomNum}`;
  };

  // Function to preprocess input text and replace special character codes
  // Preprocess input to replace special character codes with their corresponding emojis
  // Preprocess input to replace special character codes with their corresponding emojis
  const preprocessInputString = (input) => {
    return input.replace(/@R|@G|@W/g, (match) => specialCharacters[match] || match);
  };


  // Function to generate intermediate steps between two characters
  const generateSteps = (startChar, endChar) => {
    const steps = [];

    // If startChar is a special character, handle it separately
    if (Object.values(specialCharacters).includes(startChar)) {
      steps.push(startChar);
      return steps; // Return early since we don't need intermediate steps for special characters
    }

    // If endChar is a special character, handle it separately
    if (Object.values(specialCharacters).includes(endChar)) {
      steps.push(endChar);
      return steps; // Return early since we don't need intermediate steps for special characters
    }

    let startIndex = allowedChars.indexOf(startChar);
    let endIndex = allowedChars.indexOf(endChar);

    // If either character is not in allowedChars, return early
    if (startIndex === -1 || endIndex === -1) return steps;

    const stepDirection = startIndex <= endIndex ? 1 : -1;

    for (let i = startIndex; stepDirection > 0 ? i <= endIndex : i >= endIndex; i += stepDirection) {
      steps.push(allowedChars[i]);
    }

    return steps;
  };


  const animateCharacter = (char, index, steps) => {
    if (isAnimating) {
      return; // Do not proceed if animation is already in progress
    }

    let stepIndex = 0;
    const baseDelay = 30; // Adjust the base delay as needed (e.g., 300 milliseconds)
    const maxRandomDelay = 40; // Maximum random delay in milliseconds
    const getRandomDelay = () => Math.random() * maxRandomDelay;

    setIsAnimating(true);

    const animateStep = () => {
      const stepChar = steps[stepIndex];
      const nextChar = steps[stepIndex + 1] || char;
      const randomDelay = getRandomDelay();

      setFlippedText((prevText) => {
        const newText = [...prevText];
        newText[index] = {
          char: <Step char={stepChar === '\u00A0' ? ' ' : stepChar} />,
          nextChar: <Step char={nextChar === '\u00A0' ? ' ' : nextChar} />,
          flippingTop: true,
          flippingBottom: true,
        };
        return newText;
      });

      setTimeout(() => {
        setFlippedText((prevText) => {
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
          playFlipSound();
        }
      }, baseDelay + randomDelay);
    };

    animateStep();
    setIsAnimating(false);
  };

  useEffect(() => {
    if (inputText !== prevInputText) {
      // Preprocess the input text before further processing
      const processedInputText = preprocessInputString(inputText);
      const processedPrevInputText = preprocessInputString(prevInputText);
  
      // Determine the changed indexes between the current and previous input text
      const changedIndexes = processedInputText.split('').reduce((acc, char, index) => {
        if (char !== processedPrevInputText[index]) {
          acc.push(index);
        }
        return acc;
      }, []);
  
      // Handle animations for the changed characters
      changedIndexes.forEach((index) => {
        const char = processedInputText[index];
        const prevChar = processedPrevInputText[index];
        const steps = generateSteps(prevChar || '!', char);
        animateCharacter(char, index, steps);
      });
  
      // Clear the screen by removing characters for removed characters
      if (processedInputText.length < processedPrevInputText.length) {
        const newFlippedText = flippedText.map((item, index) => {
          if (index < processedInputText.length) {
            return { ...item }; // Keep existing characters before the new input length
          } else {
            return {
              char: ' ', // Add a space for the cleared characters
              flippingTop: false,
              flippingBottom: false,
            };
          }
        });
        setFlippedText(newFlippedText);
      }
  
      // Update the previous input text
      setPrevInputText(inputText);
      console.log(processedInputText);
    }
  }, [inputText, prevInputText]);




  const handleButtonClick = (event) => {
    setInputText(event.target.value);
  };

  return (
    <div>

      <div className="flipboard">
        {flippedText.map((item, index) => (
          <div key={index} className="flipboard-char">
            <div className={`char-top-half ${item?.flippingTop ? 'flippingTop' : ''}`}>{item?.char || '\u00A0'}</div>
            <div className={`char-bottom-half ${item?.flippingBottom ? 'flippingMiddle' : ''}`}>{item?.char || '\u00A0'}</div>
            <div className={`char-bottom-half ${item?.flippingBottom ? 'flippingBottom' : ''}`}>{item?.nextChar || '\u00A0'}</div>
          </div>
        ))}
      </div>


      <input className="inputText" type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} />
    </div>
  );


};

export default Flipboard;
