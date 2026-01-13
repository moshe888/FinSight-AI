📊 FinSight AI - Financial RAG Analyzer

FinSight AI is a professional tool designed to analyze financial PDF reports using Retrieval-Augmented Generation (RAG). It leverages FastAPI, Angular 18, and OpenAI's GPT-4o to provide context-aware insights from complex financial documents.

🛠️ Tech Stack

Backend

Framework: FastAPI (Python)

Orchestration: LangChain (LCEL)

PDF Parsing: PDFMiner (High-accuracy extraction)

Vector DB: FAISS (In-memory similarity search)

Frontend

Framework: Angular 18

Styling: Tailwind CSS

State Management: Angular Signals

🚀 Quick Start

1. Prerequisites

Ensure you have the following installed:

Python 3.10+

Node.js 18+

OpenAI API Key

2. Clone & Setup Backend

# Clone the repository
git clone [https://github.com/your-username/FinSight-AI.git](https://github.com/your-username/FinSight-AI.git)
cd FinSight-AI/backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt


3. Environment Configuration

Create a .env file in the backend/ directory:

OPENAI_API_KEY=your_actual_openai_api_key


4. Setup Frontend

cd ../finsight-ui
npm install


🏃 Running the Application

Start Backend Server

cd backend
python -m uvicorn main:app --reload --port 8000


Start Frontend Dev Server

cd finsight-ui
ng serve


Access the application at: http://localhost:4200

💡 How it Works

Ingestion: Financial PDFs are processed via PDFMiner for high-fidelity text extraction.

Chunking: Documents are split into semantic chunks with overlap to maintain context.

Embedding: Text chunks are converted into vectors using OpenAI's text-embedding-3-small.

Retrieval: Relevant chunks are retrieved from the FAISS vector store based on user queries.

Generation: GPT-4o synthesizes the retrieved context to provide accurate, professional answers.

📜 License

Distributed under the MIT License. See LICENSE for more information.

