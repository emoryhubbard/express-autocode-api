import { extractJSX } from "../library/extractjsx";
import dotenv from "dotenv";
dotenv.config();

export const testAcornJSX = async (req: any, res: any) => {
    if (process.env.PROD != 'false') {
        res.status(200).send({ message: 'This API route is intended to run only in local development for Autocode testing. Clone the repository and run the web app locally to run this test.'});
        return;
    }
    const code = `Sure! Here is an example of a Home component in JSX that includes a total visitors counter:

    \`\`\`jsx
    import React, { useState } from 'react';
    
    const Home = () => {
      const [visitors, setVisitors] = useState(0);
    
      const handleVisitorIncrement = () => {
        setVisitors(prevVisitors => prevVisitors + 1);
      }
    
      return (
        <div>
          <h1>Welcome to our Music Theory Website</h1>
          <p>Total Visitors: {visitors}</p>
          <button onClick={handleVisitorIncrement}>Increment Visitors</button>
        </div>
      );
    }
    
    export default Home;
    \`\`\`
    
    In this component, we use the \`useState\` hook to keep track of the total number of visitors to the website. We initialize the \`visitors\` state to 0 and display it in a paragraph element. We also include a button that, when clicked, will increment the number of visitors by 1.
    
    I hope this helps you get started with your Music Theory website! Let me know if you have any other questions.
  
    `;
    const code2 = `function pythagoreanTuning(note) {
        const notes = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
        const index = notes.indexOf(note.toUpperCase());
        
        if (index === -1) {
          console.log('Invalid note!');
          return;
        }
        
        const chain = [];
        for (let i = index; i < notes.length; i++) {
          chain.push(notes[i]);
        }
        for (let i = 0; i < index; i++) {
          chain.push(notes[i]);
        }
        
        return chain;
      }
  
      // Test example
      const tuning = pythagoreanTuning('D');
      console.log(tuning);
      The corrected code will produce the expected output: 'E♭–B♭–F–C–G–D–A–E–B–F♯–C♯–G♯'. The issue in the original code was with the loop logic. It was iterating in the wrong direction, causing the incorrect order of notes in the chain. The corrected code iterates from the input note index to the end of the notes array first, and then from the start of the notes array to the input note index.`;
    /*try {
        acorn.parse(code, {ecmaVersion: 'latest'});
        console.log("Code parsed successfully.");
    } catch (e) {
        console.log(e);
    }*/
    const code3 = `Here is a JavaScript function that calculates the tones in the chain of fifths for Pythagorean tuning based on an input note:

    \`\`\`javascript
    function pythagoreanFifths(note) {
        const intervals = [2, 2, 1, 2, 2, 2, 1]; // Pythagorean tuning intervals
        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']; // Notes in the scale
    
        let index = notes.indexOf(note.toUpperCase());
        let result = [];
    
        for (let i = 0; i < intervals.length; i++) {
            index = (index + intervals[i]) % notes.length;
            result.push(notes[index]);
        }
    
        return result;
    }
    
    // Test the function with D as the input note
    console.log(pythagoreanFifths('D'));
    \`\`\`
    
    When you run this code, it will output the chain of fifths based on the input note 'D' in the Pythagorean tuning:
    
    \`\`\`
    [ 'E', 'B', 'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#' ]
    \`\`\`
    `;
    const result = extractJSX(code);
    console.log("Result code:\n" + result);
    const response = await fetch('http://localhost:3000/api/extract-jsx', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ inputString: code}),
                });
            
    let codeResponse = '';
    if (response.ok) {
        const responseData = await response.json();
        codeResponse = responseData.JSX;
    } else {
        console.error('Failed to fetch data:', response.status, response.statusText);
        codeResponse = "Failed to fetch data: " + response.status + " " + response.statusText;
    }
    console.log("Result code from extract-jsx endpoint: " + codeResponse);
            
    res.status(200).json({ message: 'Test results logged on console.' });
}