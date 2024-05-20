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
  const [prevInputText, setPrevInputText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);


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

    const stepDirection = currentCharCode <= endCharCode ? 1 : -1;

    while (currentCharCode !== endCharCode + stepDirection) {
      if (currentCharCode === 32) {
        steps.push('\u00A0'); // Add non-breaking space
      } else {
        steps.push(String.fromCharCode(currentCharCode));
      }
      currentCharCode += stepDirection;
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
      const changedIndexes = inputText.split('').reduce((acc, char, index) => {
        if (char !== prevInputText[index]) {
          acc.push(index);
        }
        return acc;
      }, []);

      changedIndexes.forEach((index) => {
        // Handle animation for the changed character at index
        const char = inputText[index];
        const prevChar = prevInputText[index];
        const steps = generateSteps(prevChar || '!', char);
        console.log(steps);
        animateCharacter(char, index, steps);
      });

      // Clear the screen by removing characters for removed characters
      if (inputText.length < prevInputText.length) {
        const newFlippedText = flippedText.map((item, index) => {
          if (index < inputText.length) {
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

      setPrevInputText(inputText);
      console.log(inputText);
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
