# Overview

- [Autocode Front-End](https://github.com/emoryhubbard/autocode): The front-end Angular application for Autocode.
- [Express Autocode API](https://github.com/emoryhubbard/express-autocode-api): The Express API backend for Autocode.

The Autocode project includes both a front-end application and an Express API backend. This Express API serves as the backend for the [Autocode](https://autocode-five.vercel.app/) front-end and facilitates the self-testing and self-debugging functionalities. The backend is deployed on [Render](https://render.com/), making it accessible and efficient.

**[Autocode Version 2.0 Demo Video](https://youtu.be/zm6YHLV1Dag)**

**[Autocode Version 1.0 Demo Video](https://youtu.be/Iq5_HaKzL6Y)**

You can access the API directly at https://express-autocode-api.onrender.com/api/generate with a POST request (navigating there with just your browser won't work). Detailed API docs to be uploaded at a future date. For now, POST to api/generate with a json body that contains two strings: apiKey (your ChatGPT API key) and userPrompt (the prompt specifying what code you want to generate). Endpoint will return a JSON object that contains a string named code ({ code }).

# Development Environment

The backend of Autocode is developed using the following technologies and tools:


- **ExtractJS:** The [ExtractJS](https://github.com/emoryhubbard/extractjs) project addresses a specific problem encountered during the development of Autocode: the precise detection and extraction of JavaScript code from text passages.
- **Express:** The Express framework is used for building the REST API. It provides a robust set of features for web and mobile applications.
- **TypeScript:** TypeScript is used for its static typing and type-checking capabilities, which enhance code quality and maintainability.
- **Puppeteer:** Puppeteer, a Node library, is used for automated testing and debugging. It facilitates the execution of generated code and the capture of debug information.
- **@sparticuz/chromium:** The "@sparticuz/chromium" package is a modern replacement for "chrome-aws-lambda," offering the capabilities needed for headless browser automation.

The backend is designed to work seamlessly with the Angular front-end, ensuring a smooth user experience.

# Future Work

- Continuously improve and optimize the backend for better performance.
- Enhance error handling and reporting for a more robust application.
- Explore and implement additional features for improved code generation and testing.