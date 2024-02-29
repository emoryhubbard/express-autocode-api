import { extractJS } from "../library/extractjs";

export const testAcorn = async (req: any, res: any) => {
    if (process.env.PROD != 'false') {
        res.status(200).send({ message: 'This API route is intended to run only in local development for Autocode testing. Clone the repository and run the web app locally to run this test.'});
        return;
    }
    const code = `Sure! Here's a JavaScript function that calculates the chain of fifths for Pythagorean tuning based on an input note:

	\`\`\`javascript
	function pythagoreanTuning(note) {
        const notes = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
        const index = notes.indexOf(note.toUpperCase());
        
        if (index === -1) {
          console.log('Invalid note!');
          return;
        }
        
        const chain = [];
        for (let i = index; i >= 0; i--) {
          chain.push(notes[i]);
        }
        for (let i = 11; i > index; i--) {
          chain.push(notes[i]);
        }
        
        return chain;
      }
  
      // Test example
      const tuning = pythagoreanTuning('D');
      console.log(tuning);
      \`\`\`
  
      This code defines the \`pythagoreanTuning\` function that takes an input note as a parameter. It first checks if the note is valid, and if not, it logs an error message and returns. Otherwise, it calculates the chain of fifths by iterating backwards from the input note and then forwards from the last note to the end of the array. The function returns the resulting chain.
  
      In the example test, we call the \`pythagoreanTuning\` function with the note 'D' and store the result in the \`tuning\` variable. We then log the contents of \`tuning\` to the console using \`console.log\`.
  
      When you run this code, it should output:
  
      \`\`\`
      [ 'E♭', 'B♭', 'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'C♯', 'G♯' ]
      \`\`\`
  
      This shows the chain of fifths for D-based Pythagorean tuning starting from the note D.
  
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
    const result = extractJS(code3);
    console.log("Result code:\n" + result);
    res.status(200).json({ message: 'Test results logged on console.' });
}