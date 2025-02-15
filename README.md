# GO-AI Backend

GO-AI Backend is a **Node.js** application that serves as the backend for a **Go-playing system**. This backend provides essential functionalities for managing Go games, interfacing with AI engines, and processing game logic efficiently.

## Getting Started

To set up and run the server locally, follow these steps:

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (latest stable version recommended)
- [Python](https://www.python.org/) (for script execution)

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/axyl-casc/GO-AI-backend.git
   cd GO-AI-backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Running the Server
To start the server, execute:
```sh
python ./run_server.py
```
This will initialize the backend and make it ready for handling Go game requests.

You can access it via http://localhost:3001 on your local network. 

## Features
- Supports **game logic processing** for the Go AI.
- Interfaces with **Go engines** like KataGo and GTP-based AI.
- Provides **API endpoints** for game interactions.
- Can be extended with **custom AI models**.


---
