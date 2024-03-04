# Realtime Code Editor with Video Calling

## Introduction

The Realtime Code Editor is an innovative collaborative platform that combines real-time coding with video calling. It's an ideal solution for pair programming, code reviews, coding sessions with friends, and especially for conducting technical interviews.

## Screenshots

![](/images/single-person.png)
![](/images/in-call.png)

## Features

-   **Real-time collaboration:** Seamlessly edit code with peers in real-time.
-   **Video calling:** Integrated video calling to communicate and review code.

## Libraries

-   **Real-time Communication:** Socket.io for seamless real-time interaction.
-   **Video Streaming:** Simple-peer for efficient peer-to-peer video streaming.

### Getting Started

To get started with the Realtime Code Editor, follow these steps:

1. Clone the repo

```sh
git clone https://github.com/sujay000/realtime-codeEditor.git
```

2. Navigate to the Project Directory:

```sh
cd realtime-codeEditor
```

3. Navigate into the server folder

```sh
cd server
```

4. To run the backend

```sh
npm i && node index.js
```

5. Open another terminal window and Navigate to client folder

```sh
 cd client
```

6. To run the frontend

```sh
 npm i && npm run dev
```

We will require an online judge to run the code, either locally or online. Judge0 or Codex-api can be used.
Make sure change it in `server\index.js`

## Upcoming Features

In the future updates of Realtime Code Editor, users can look forward to:

-   **Syntax Highlighting**: Enhance your coding experience with syntax highlighting, which will make reading and writing code easier on the eyes.

-   **Multiple Language Support**: While currently supporting C++, we are working on adding support for various other programming languages to accommodate a wider range of developers.
